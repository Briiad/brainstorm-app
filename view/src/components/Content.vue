<template>
  <!-- Chat Bar -->
  <section class="h-full w-full md:w-2/5 flex flex-col justify-between p-8 bg-neutral-900">
    <div class="h-1/4 pb-8 md:p-0 text-center font-bold text-6xl text-[#6419fa]">
      <h1>DANA-GPT</h1>
    </div>

    <div class="h-3/4">
      <!-- AI response box -->
      <div class="bg-neutral-800 p-4 mb-4 h-48 md:h-3/4 overflow-y-auto">
        <p class="text-white text-justify">{{$store.state.response}}</p>
      </div>

      <!-- User prompt -->
      <div class="flex items-center justify-between mb-4">
        <form @submit="submission" method="post" class="w-full flex justify-around text-white">
          <input v-model="prompt.question" type="text" class="w-full bg-neutral-800 p-2" placeholder="Enter your prompt">
          <button type="submit" @click="isSubmit" class="bg-[#6419fa] text-white px-4 py-2">Submit</button>
        </form>
      </div>

      <!-- Buttons -->
      <div class="flex flex-row-reverse justify-between">
        <div class="flex flex-row-reverse justify-around">
          <button @click="addToGraph" class="bg-green-500 text-white px-4 py-2 ml-4 rounded" :class="{'hidden':!submit}">Add to Graph</button>
          <button @click="updateGraph" class="bg-yellow-500 text-white px-4 py-2 rounded"  :class="{'hidden':!submit}">Update</button>
        </div>
        <!-- Reset -->
        <button @click="resetGraph" class="bg-red-500 text-white px-4 py-2 rounded" :class="{'hidden':!submit}">Reset</button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
    name: 'Content',
    data() {
        return {
            submit: false,
            prompt: {
                question: null
            }
        };
    },
    methods: {
        isSubmit() {
            this.submit = true;
        },
        async submission(e) {
            const res = await this.$store.commit('setPrompt', this.prompt);
            e.preventDefault();
        },
        async addToGraph(e) {
            const res = await this.$store.commit('setGraph');
            e.preventDefault();
        },
        async updateGraph(e) {
            const res = await this.$store.commit('updateGraph');
            e.preventDefault();
        },
        async resetGraph(e) {
            this.submit = false;
            const res = await this.$store.commit('resetProcess');
            e.preventDefault();
        }
    },
}
</script>

<style scoped>
/* Your component's styles go here */
</style>
