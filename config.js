var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

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
  this.PROJECT_DIR = __dirname;
  this.BASE_URL = '';
  this.APPLICATION_URL = '';
  this.ITEMS_PER_PAGE = 30;
  this.SITE_LANGUAGE = 1; // For english
  this.SITE_TITLE = '1-800-FLOWERS.COM';
  this.SITE_URL = 'https://www.0800flowers.com';

  this.SMTP_TRANSPORT = nodemailer.createTransport(smtpTransport({
      host: 'smtp.gmail.com',
      secure: 'tls',
      port: '465',
      auth: {
          user: 'apptestmobikasa@gmail.com',
          pass: '12345@9876'
      }
  })); 
}
module.exports = new Config();
