<template>
  <v-container>
    <v-row class="text-center">
      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Checkbox
        </h2>
        <v-row justify="center">
          <v-checkbox id="foo-checkbox-2" label="Foo 2 checkbox" />
        </v-row>
      </v-col>
      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          CTRL+A
        </h2>
        <v-row justify="center">
          <v-text-field class="ctrl-a" label="CTRL+A" value="foo is bar" />
        </v-row>
      </v-col>
      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Post Body
        </h2>
        <v-row justify="center">
          <v-btn @click="post()">
            Post
          </v-btn>
        </v-row>
      </v-col>
      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Service Worker
        </h2>
        <v-row justify="center">
          <v-btn @click="runWorker()">
            Run Worker
          </v-btn>
        </v-row>
        <v-row justify="center">
          <v-col>
            <span class="worker-message">{{ workerMessage }}</span>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import axios from 'axios';

  export default Vue.extend({
    name: 'HelloWorld',

    data: () => ({
      workerMessage: '',
    }),
    methods: {
      async post() {
        try {
          const body = { foo: 'bar', number: 1, object: { a: 1, b: '2'}};
          await axios.post('/api/v0/foo', body);
        } catch (err) {
          console.error(err);
        }
      },
      async handleWorkerMessage(e: any) {
        console.log('handleWorkerMessage(): ', e);
        // Terminate worker
        e.target.terminate();
        this.workerMessage = e.data.foo;
      },
      async runWorker() {
        this.workerMessage = 'Downloading...';
        const worker = new Worker(new URL('../js/worker.js', import.meta.url));
        worker.addEventListener('message', this.handleWorkerMessage);
        worker.postMessage({
          location: {
            host: window.location.host,
            protocol: window.location.protocol,
          },
        });
      }
    }
  })
</script>
