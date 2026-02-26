const csv = `"Name","Age"\n"John","=cmd|calc"\n"Doe",=+abc\nJane,-123\n@foo,@bar`;
const sanitized = csv
  .replace(/(^|,)"([=+\-@])/gm, '$1"\'$2')
  .replace(/(^|,)([=+\-@])/gm, "$1'$2");
console.log(sanitized);
