import wrapper from 'solc/wrapper';
import shajs from 'sha.js';
import semver from 'semver';

let releaseVersions = null;

async function fetchReleaseVersions(location) {
  const binList = `${location.protocol}//${location.host}/solc/bin/list.json`;
  const wasmList = `${location.protocol}//${location.host}/solc/wasm/list.json`;
  if (releaseVersions === null) {
    try {
      const binData = await (await fetch(binList)).json();
      const binVersions = binData.builds.slice().reverse()
        .filter((v) => !v.prerelease)
        .map((v) => ({ ...v, source: `https://solc-bin.ethereum.org/bin/${v.path}` }));
      const wasmData = await (await fetch(wasmList)).json();
      const wasmVersions = wasmData.builds.slice().reverse()
        .filter((v) => !v.prerelease)
        .map((v) => ({ ...v, source: `https://solc-bin.ethereum.org/wasm/${v.path}` }));
      releaseVersions = binVersions.map((binVersion) => {
        const wasmVersion = wasmVersions.filter((v) => v.version === binVersion.version)[0];
        if (wasmVersion) {
          return wasmVersion;
        }
        return binVersion;
      });
    } catch {
      throw new Error('Could not load compiler versions');
    }
  }
}

async function validateCompiler(version) {
  const text = await (await fetch(version.source)).text();
  const hash = shajs('sha256').update(text).digest('hex');
  if (`0x${hash}` !== version.sha256) {
    throw new Error('Could not verify compiler integrity');
  }
}

function loadCompiler(self, version) {
  try {
    delete self.Module;
    self.Module = undefined;
    self.importScripts(version.source);
    return wrapper(self.Module);
  } catch {
    throw new Error('Failed to load compiler');
  }
}

function getVersionFromPragma(version, allowedVersions) {
  const targetVersion = semver.maxSatisfying(allowedVersions.map((v) => v.version), version);
  if (targetVersion === null) {
    throw new Error('No compiler with matching version');
  }
  return allowedVersions.filter((v) => v.version === targetVersion)[0];
}

onmessage = async (e) => {
  const { location } = e.data;
  try {
    await fetchReleaseVersions(location);
    const version = getVersionFromPragma('0.8.8', releaseVersions);
    await validateCompiler(version);
    const solc = loadCompiler(self, version);
    console.log('downloaded: ', solc);

    self.postMessage({
      foo: 'bar',
    });
  } catch (err) {
    self.postMessage({ err: { message: err.message, name: err.name } });
  }
};
