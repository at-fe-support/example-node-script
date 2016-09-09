const parse = require('parse-link-header');
const XMLHttpRequest = require('xhr2');
const xhr = new XMLHttpRequest();

/**
 * @user Read automatically from third argument for user
 * @page Default is 1 and increase if response has pagination
 */
let cruiser = (user = process.argv[2], page = 1) => {
  // Stop and output usage if an invalid input for username
  if (!user && typeof user !== 'string') {
    console.warn(`Usage:\nGITHUB_USER    A valid GitHub username`);
    process.exit(-1);
  }

  // Construct request with default OAuth applications
  // You can setup your own app with its ID/Secret key here: https://github.com/settings/applications
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
      // Output all responsed headers if `--debug` argument found
      if (process.argv[3] === '--debug') {
        console.log(xhr.getAllResponseHeaders() + '\n---\n');
      }

      // Output result
      if (xhr.response.length) {
        xhr.response.map(value => {
          // Append `/releases.atom` for repo releases feed,
          // feel free to modify and output anything you want.
          process.stdout.write(`${value.html_url}/releases.atom\n`);
        });
      } else {
        console.log('No starred repo!');
        process.exit(1);
      }

      // Read responsed `link` header for pagination
      let link = xhr.getResponseHeader('link');
      let parsed = parse(link);

      // Only recurisve for more result if next page exists
      if (parsed && parsed.next) {
        cruiser(user, parsed.next.page);
      }
    }
  };

  xhr.send();
}

// Do the magic
cruiser();
