const scaffold = require('./scaffold');
const name = process.argv[2];
scaffold('org-role', name); // 'org-role's -> org-roles handled by scaffold pluralizer
