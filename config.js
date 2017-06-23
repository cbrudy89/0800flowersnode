function Config() {
  this.SECRET_KEY = 'thisismysecretkey';
  this.SALT_ROUND = 10;
}

module.exports = new Config();