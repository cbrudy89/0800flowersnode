module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : '1800flowersInt',
      script    : 'server.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    },

    // Second application
    /*{
      name      : 'WEB',
      script    : 'web.js'
    }*/
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      key  : '/home/mistry/Downloads/nodejs.pem',
      user : 'ubuntu',
      host : '13.58.120.75',
      ref  : 'origin/master',
      repo : 'https://prashant-mobikasa:Passw0rd@team.mobikasa.net/0800flowersIntNode.git',
      path : '/home/ubuntu/18fInt',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
},
    /*dev : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/development',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }*/
  }
};

