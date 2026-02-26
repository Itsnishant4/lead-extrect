const csv = `"Name","Email"\n"=cmd|calc",test@test.com\n"=+abc",def\n-123,456`;
const sanitized = csv.replace(/^"([=+\-@])/gm, '"\'$1').replace(/^([=+\-@])/gm, "'$1");
console.log(sanitized);
