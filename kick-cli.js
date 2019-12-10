process.env.NODE_PATH = ".";
process.env.NODE_ENV = "dev";
require("module").Module._initPaths();

const program = require('commander');
const kickstart = require('./includes/kickstart.js');
const User = require('./models/User.js');
const uuid = require('uuid');

const cli = kickstart._init_cli();

program
  .version('0.0.1')
  .description('Kick a simple express js kickstarter');

program
  .command('addUser <fullname> <username> <password> <phone> <admin> <emailConfirmed>')
  .alias('a')
  .description('Add new user')
  .action((fullname, username, password, phone, admin, emailConfirmed) => {
    var user = new User({
      fullname:fullname,
      username:username,
      email:username,
      phone: phone,
      isAdmin: admin ? true : false,
      password: password
    });
    user.emailConfirmed = emailConfirmed ? true : false;
    user.confirmationToken = uuid.v4();
    user.save(function(){
      cli.close();
    });
  });

program.parse(process.argv);
