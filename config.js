var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

function Config() {
  this.SECRET_KEY = 'thisismysecretkey';
  this.PORT = 8080;

  this.JWT_EXPIRATION_TIME = 1800; // 30 minutes
  this.JWT_REFRESH_TIME = 10; // 10 seconds

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
host: 'email-smtp.us-west-2.amazonaws.com',
//        secure: 'tls',
        port: '587',
        auth: {
            user: 'AKIAIKYWOZ4XZNQU4PYA',
            pass: 'AmIuONqgAtBSs97LPOGYoAfPcWG8FcsDbEuLI5NACw9K'
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
  //this.ADMIN_FROM_EMAIL = 'internationalmarketing@1800flowers.com';
  this.ADMIN_FROM_EMAIL = 'devlopers@mobikasa.com';

  this.atlas_order = {
          /************************
          | atlas config for LIVE |
          ************************/
          /*'source_id' : 'W0093',
          'store_id' : '348',
          'site_id' : '18F',
          'customer_type' : 'R',
          'customer_id' : '',
          'source_system' : 'WEB',
          'brand_code' : '1001',
          'itemServiceChargeAmount' : "14.99", 
          'username' : 'abi20@abi.com',
          'password' : 'abc123',
          'scope' : '/submitOrder/v1',
          'grant_type' : 'password', 
          'client_id' : '738faec6-a0c0-4ff9-9048-892486109baf',
          'client_secret' : 'yI4kB8gJ4kF0dG0fA4qY4aQ2mQ8jA8eN4iR5bI2xI5rI3eK7sR',
          'mobileuat_client_id' : '950b0dc9-8970-4ec5-9de0-4d6db805e870',  
          'auth_url' : 'https://ecommerce.800-flowers.net/order/prod/submitOrder/v1/oauth/authorize',
          'submit_order_url' : 'https://ecommerce.800-flowers.net/order/prod/submitOrder/v1',
          'get_earliest_delivery_date_url' : 'https://ecommerce.800-flowers.net/order/prod/product/v1/getEarliestDeliveryDate',
          'check_availability_url' : 'https://ecommerce.800-flowers.net/order/prod/product/v1/checkAvailability',
          'get_delivery_calendar_url' : 'https://ecommerce.800-flowers.net/order/prod/product/v1/getDeliveryCalendar',
          'get_next_order_number_url' : 'https://ecommerce.800-flowers.net/order/prod/product/v1/getNextOrderNumber',
          'get_order_status_url' : 'https://ecommerce.800-flowers.net/order/prod/customer/v1/getOrderStatus', 
          'check_zip_service_url' : 'https://ecommerce.800-flowers.net/order/prod/product/v1/checkZipService',
          'payment' : {
              'scope' : '/payment/v1',
              'auth_url' : 'https://ecommerce.800-flowers.net/order/prod/payment/v1/oauth/authorize',
              'tokenizecc_url' : 'https://ecommerce.800-flowers.net/order/prod/payment/v1/tokenizeCC',
              'authorizecc_url' : 'https://ecommerce.800-flowers.net/order/prod/payment/v1/authorizeCC',
              'auth_username' : 'w0093user',
              'auth_password' : 'w0093password',
              'division_number' : '126367',
              'transaction_type' : '7',
              'telephone_type' : 'd',
          }*/

          /**********************
          | atlas config for QA |
          **********************/ 
          'source_id' : 'W0091',
          'store_id' : '20051',
          'site_id' : '18F',
          'customer_type' : 'R',
          'customer_id' : '',
          'source_system' : 'WEB',
          'brand_code' : '1001',
          'itemServiceChargeAmount' : "14.99",
          'username' : 'ankit@mobikasa.com',
          'password' : 'mobikasa1', 
          'scope' : '/submitOrder/v1',
          'grant_type' : 'password', 
          'client_id' : '61972f2a-95fc-46ca-88fa-9bb4f58e0fcf', 
          'client_secret' : 'Q7uG5nY1eV1jG8jP5gY1dH1gJ4lY1rB3oG5uY1rN3iH6fE5pB2', 
          'mobileuat_client_id' : '950b0dc9-8970-4ec5-9de0-4d6db805e870', 
          'auth_url' : 'https://ecommerce.800-flowers.net/order/uat/submitOrder/v1/oauth/authorize',
          'submit_order_url' : 'https://ecommerce.800-flowers.net/order/uat/submitOrder/v1',
          'get_earliest_delivery_date_url' : 'https://ecommerce.800-flowers.net/order/uat/product/v1/getEarliestDeliveryDate',
          'check_availability_url' : 'https://ecommerce.800-flowers.net/order/uat/product/v1/checkAvailability',
          'get_delivery_calendar_url' : 'https://ecommerce.800-flowers.net/order/uat/product/v1/getDeliveryCalendar',
          'get_next_order_number_url' : 'https://ecommerce.800-flowers.net/order/uat/product/v1/getNextOrderNumber',
          'get_order_status_url' : 'https://ecommerce.800-flowers.net/order/uat/customer/v1/getOrderStatus', 
          'check_zip_service_url' : 'https://ecommerce.800-flowers.net/order/uat/product/v1/checkZipService',
          'payment' : {
              'scope' : '/payment/v1',
              'auth_url' : 'https://ecommerce.800-flowers.net/order/uat/payment/v1/oauth/authorize',
              'tokenizecc_url' : 'https://ecommerce.800-flowers.net/order/uat/payment/v1/tokenizeCC',
              'authorizecc_url' : 'https://ecommerce.800-flowers.net/order/uat/payment/v1/authorizeCC',
              'auth_username' : 'test',
              'auth_password' : 'test',
              'division_number' : '126367',
              'transaction_type' : '7',
              'telephone_type' : 'd',
          } 
      };
  this.week_days = {
          '1':'Sunday', '2':'Monday', '3':'Tuesday', '4':'Wednesday', '5':'Thursday', '6':'Friday', '7':'Saturday'
      };
  this.stoppage_hour = [
           '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
      ];
  this.stoppage_minute = [
          '00', '15', '30', '45' 
      ];
      /*'delivery_policy' : {
          'direct_ship_delivery_policy' : 'Direct Ship Delivery Policy', 
          'terms_conditions' : 'Terms &amp; Conditions', 
          'the_substitution_policy' : 'The Substitution Policy', 
          'same_day_delivery_policy' : 'Same Day Delivery Policy'
      },*/
  this.delivery_policy = [
          'Direct Ship Delivery Policy', 'Terms &amp; Conditions', 'The Substitution Policy', 'Same Day Delivery Policy'
      ];
  this.delivery_within = [
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
      ];
  this.days = [
          '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
      ];
  this.months_short = {
          '1':'Jan', '2':'Feb', '3':'Mar', '4':'Apr', '5':'May', '6':'Jun', '7':'Jul', '8':'Aug', '9':'Sep', '10':'Oct', '11':'Nov', '12':'Dec'
      };
  this.right_sentiments = {
          '1':'Immediate Family Member', '2':'Close Relative', '3':'Friend/Colleague'
      };
  this.price_filter = {
          '0-49.99':'49.99 or less', '50-99.99':'50 - 99.99 ','100-149.99':'100 - 149.99 ','150-10000':'150 and above '
      };

  this.snipes = {
         'home' : 'Home', 'collections' : 'Collections', 'product_detail' : 'Product Detail', 'billing' : 'Billing',
      };
      
  this.continent_names={
          '1' : 'Asia', '2' : 'Africa', '3' : 'Europe', '4' : 'North America', '5' : 'Oceania', '6' : 'South America'
          };

  this.saturday_charge = '4.99';
  this.message_count = '250';
  this.order_status = {
          '0' : 'pending', '1' : 'in-progress', '2' : 'completed', '3' : 'cancelled'
      };
  this.monthnamecaps=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];    
  this.zipcode_type = ['None','Numeric','Alphanumeric','Characters'];
  this.mob_per_page = 14; //collection page search result pagination for mobile
  this.desk_per_page = 30; //collection page search result pagination for desktop
  this.admin_email = 'intlplatdev@gmail.com';
  this.admin_from_email = 'internationalmarketing@1800flowers.com';
  this.cdn = {
          //'d3fvqk0inphh7m.cloudfront.net' : 'css|js|eot|woff|ttf|jpg|jpeg|png|gif|svg' //for domain qa
          'd1a5qgm1dri5tp.cloudfront.net' : 'css|js|eot|woff|ttf|jpg|jpeg|png|gif|svg' //for domain live
      };
  this.pagination={'limit_10':'10', 'limit_15':'15', 'limit_20':'20'};
  this.triple_des_key = '18F-Super-WiDoW5Mobi1eKe!';
  this.cad_currency_code = 'CAD';
  this.default_zipcode = '00000';

}
module.exports = new Config();
