const { app } = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Fuse API listening on port ${PORT}`);
});
