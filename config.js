function Config() {
  this.SECRET_KEY = 'thisismysecretkey';
  this.SALT_ROUND = 10;
  this.SUCCESS = true;
  this.ERROR = false,
  this.ROLE_ADMIN = 1,
  this.ROLE_VENDOR = 2,
  this.ROLE_CUSTOMER = 3,
  this.HTTP_SUCCESS = 200; // Success
  this.HTTP_BAD_REQUEST = 400; // Bad Request URI or Field missing or not valid
  this.HTTP_FORBIDDEN = 403; // Unauthorized access or no premission
  this.HTTP_NOT_FOUND = 404; // Not Found
  this.HTTP_ALREADY_EXISTS = 409; // User already exist
  this.HTTP_SERVER_ERROR = 500; // Server Error 
}

module.exports = new Config();