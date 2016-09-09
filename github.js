const parse = require('parse-link-header');
const XMLHttpRequest = require('xhr2');
const xhr = new XMLHttpRequest();

let cruiser = function (user = process.argv[2], page = 1) {
  if (!user && typeof user !== 'string') {
    console.warn(`Usage:\nGITHUB_USER    A valid GitHub username`);
    process.exit(-1);
  }

  xhr.open(
    'GET',
    'https://api.github.com/users/' + user +
    '/starred?page=' + page +
    '&client_id=11b3b66b20fa9238a05b&client_secret=dba2fb0f51e5cadf3f82c32c1ff077e2299e8d27'
  );
  xhr.responseType = 'json';
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      if (process.argv[3] === '--debug') {
        console.log(xhr.getAllResponseHeaders() + '\n---\n');
      }

      if (xhr.response.length) {
        xhr.response.map(value => {
          process.stdout.write(`${value.html_url}/releases.atom\n`);
        });
      } else {
        console.log('No starred repo!');
        process.exit(1);
      }

      let link = xhr.getResponseHeader('link');
      let parsed = parse(link);

      if (parsed && parsed.next) {
        cruiser(user, parsed.next.page);
      }
    }
  };

  xhr.send();
}

cruiser();
