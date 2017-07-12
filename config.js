var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

function Config() {
  this.SECRET_KEY = 'thisismysecretkey';
  this.PORT = 8080;

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


  this.SMTP_TRANSPORT = nodemailer.createTransport(smtpTransport({
      host: 'smtp.gmail.com',
      secure: 'tls',
      port: '465',
      auth: {
          user: 'apptestmobikasa@gmail.com',
          pass: '12345@9876'
      }
  }));

  this.SITE_LANGUAGE = 1; // For english
  this.SITE_TITLE = '1-800-FLOWERS.COM';
  this.SITE_URL = 'https://www.0800flowers.com';

  this.ITEMS_PER_PAGE = 30;
  this.DEFAULT_ZIPCODE = '00000';

  this.ZIPCODE_LENGHT = [0,1,2,3,4,5,6,7,8,9,10];
  this.ZIPCODE_TYPE = ['None','Numeric','Alphanumeric','Characters'];
  this.ADMIN_EMAIL = 'intlplatdev@gmail.com';
  this.ADMIN_FROM_EMAIL = 'internationalmarketing@1800flowers.com';

//this.atlas_order = [
        /************************
        | atlas config for LIVE |
        ************************/
        /*'source_id' => 'W0093',
        'store_id' => '348',
        'site_id' => '18F',
        'customer_type' => 'R',
        'customer_id' => '',
        'source_system' => 'WEB',
        'brand_code' => '1001',
        'itemServiceChargeAmount' => "14.99", 
        'username' => 'abi20@abi.com',
        'password' => 'abc123',
        'scope' => '/submitOrder/v1',
        'grant_type' => 'password', 
        'client_id' => '738faec6-a0c0-4ff9-9048-892486109baf',
        'client_secret' => 'yI4kB8gJ4kF0dG0fA4qY4aQ2mQ8jA8eN4iR5bI2xI5rI3eK7sR',
        'mobileuat_client_id' => '950b0dc9-8970-4ec5-9de0-4d6db805e870',  
        'auth_url' => 'https://ecommerce.800-flowers.net/order/prod/submitOrder/v1/oauth/authorize',
        'submit_order_url' => 'https://ecommerce.800-flowers.net/order/prod/submitOrder/v1',
        'get_earliest_delivery_date_url' => 'https://ecommerce.800-flowers.net/order/prod/product/v1/getEarliestDeliveryDate',
        'check_availability_url' => 'https://ecommerce.800-flowers.net/order/prod/product/v1/checkAvailability',
        'get_delivery_calendar_url' => 'https://ecommerce.800-flowers.net/order/prod/product/v1/getDeliveryCalendar',
        'get_next_order_number_url' => 'https://ecommerce.800-flowers.net/order/prod/product/v1/getNextOrderNumber',
        'get_order_status_url' => 'https://ecommerce.800-flowers.net/order/prod/customer/v1/getOrderStatus', 
        'check_zip_service_url' => 'https://ecommerce.800-flowers.net/order/prod/product/v1/checkZipService',
        'payment' => [
            'scope' => '/payment/v1',
            'auth_url' => 'https://ecommerce.800-flowers.net/order/prod/payment/v1/oauth/authorize',
            'tokenizecc_url' => 'https://ecommerce.800-flowers.net/order/prod/payment/v1/tokenizeCC',
            'authorizecc_url' => 'https://ecommerce.800-flowers.net/order/prod/payment/v1/authorizeCC',
            'auth_username' => 'w0093user',
            'auth_password' => 'w0093password',
            'division_number' => '126367',
            'transaction_type' => '7',
            'telephone_type' => 'd',
        ]*/

        /**********************
        | atlas config for QA |
        **********************/ 
      /*  'source_id' => 'W0091',
        'store_id' => '20051',
        'site_id' => '18F',
        'customer_type' => 'R',
        'customer_id' => '',
        'source_system' => 'WEB',
        'brand_code' => '1001',
        'itemServiceChargeAmount' => "14.99",
        'username' => 'ankit@mobikasa.com',
        'password' => 'mobikasa1', 
        'scope' => '/submitOrder/v1',
        'grant_type' => 'password', 
        'client_id' => '61972f2a-95fc-46ca-88fa-9bb4f58e0fcf', 
        'client_secret' => 'Q7uG5nY1eV1jG8jP5gY1dH1gJ4lY1rB3oG5uY1rN3iH6fE5pB2', 
        'mobileuat_client_id' => '950b0dc9-8970-4ec5-9de0-4d6db805e870', 
        'auth_url' => 'https://ecommerce.800-flowers.net/order/uat/submitOrder/v1/oauth/authorize',
        'submit_order_url' => 'https://ecommerce.800-flowers.net/order/uat/submitOrder/v1',
        'get_earliest_delivery_date_url' => 'https://ecommerce.800-flowers.net/order/uat/product/v1/getEarliestDeliveryDate',
        'check_availability_url' => 'https://ecommerce.800-flowers.net/order/uat/product/v1/checkAvailability',
        'get_delivery_calendar_url' => 'https://ecommerce.800-flowers.net/order/uat/product/v1/getDeliveryCalendar',
        'get_next_order_number_url' => 'https://ecommerce.800-flowers.net/order/uat/product/v1/getNextOrderNumber',
        'get_order_status_url' => 'https://ecommerce.800-flowers.net/order/uat/customer/v1/getOrderStatus', 
        'check_zip_service_url' => 'https://ecommerce.800-flowers.net/order/uat/product/v1/checkZipService',
        'payment' => [
            'scope' => '/payment/v1',
            'auth_url' => 'https://ecommerce.800-flowers.net/order/uat/payment/v1/oauth/authorize',
            'tokenizecc_url' => 'https://ecommerce.800-flowers.net/order/uat/payment/v1/tokenizeCC',
            'authorizecc_url' => 'https://ecommerce.800-flowers.net/order/uat/payment/v1/authorizeCC',
            'auth_username' => 'test',
            'auth_password' => 'test',
            'division_number' => '126367',
            'transaction_type' => '7',
            'telephone_type' => 'd',
        ] 
    ];
*/




}
module.exports = new Config();
