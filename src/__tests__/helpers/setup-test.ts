export const setupTest = () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://mongo:27017/test';
};
