import urlMetadata from 'url-metadata';

function isValidURL(string){
  try {
    new URL(decodeURIComponent(string));
  } catch (_) {
    return false;
  }
  return true;
}

export default async (req, res) => {

  res.setHeader('Cache-Control', 'max-age=180000');

  return new Promise((resolve, reject) => {
    try {
      urlMetadata(req.query?.link).then((metadata) => {

        let imageLink = false;
        if (isValidURL(metadata['og:image']) === true) {
          imageLink = metadata['og:image'];
        }
        else if (metadata['og:image'] !== "" && isValidURL(metadata['url']+metadata['og:image']) === true) {
          imageLink = new URL(metadata['url']+metadata['og:image'])['href'];
        }
        else if (isValidURL(metadata['image']) === true) {
          imageLink = metadata['image'];
        }
        else if (metadata['image'] !== "" && isValidURL(metadata['url']+metadata['image']) === true) {
          imageLink = new URL(metadata['url']+metadata['image'])['href'];
        }

        if (Boolean(imageLink) === true) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            metadata,
            title: metadata['title'],
            image: imageLink
          }))
          resolve();
        }
        else {
          res.statusCode = 200;
          res.end(JSON.stringify({
            title: metadata['title'],
            image: imageLink
          }))
          resolve();
        }

      },
      (error) => {
        res.statusCode = 200;
        res.end(JSON.stringify({ 'error':error.toString() }))
        resolve();
      });

    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ 'success': false, 'error':error.toString() }))
      reject();
    }

  });
}
