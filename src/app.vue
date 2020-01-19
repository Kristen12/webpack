<template>
  <div>
    <p class="red">{{ msg }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: "Hello World！"
    };
  }
};
</script>

<style scoped>
.red {
  color: blue;
}
</style>
