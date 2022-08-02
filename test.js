// var a = new ArrayBuffer('dawdawdwd')
const http = require('http');
const superagent = require('superagent')
// const stream = fs.createReadStream('./my.json');
const url = `http://27.push2.eastmoney.com/api/qt/stock/details/sse?fields1=f1%2Cf2%2Cf3%2Cf4&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55&mpi=2000&fltt=2&pos=-0&wbp2u=%7C0%7C0%7C0%7Cweb&ut=bd1d9ddb04089700cf9c27f6f7426281&secid=0.000667`
// const req = superagent
// .get(url)
// .set({
//   'X-Forwarded-For': 124 + "." + 23
//       + "." + Math.round(Math.random() * 254)
//       + "." + Math.round(Math.random() * 254)
// })
// stream.pipe(req)
// .end(() => {
//   console.log('is end!')
// })

http.get(url, (res) => {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => {
    console.log(chunk)
    if (/"data":\s?null/.test(chunk)) {
      res.emit('end')
    }
  });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log(parsedData);
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});