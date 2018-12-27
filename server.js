var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('得到 HTTP 路径\n' + path)

if(path === '/'){
  let string = fs.readFileSync('./index.html','utf8')
  /*let users = fs.readFileSync('./db/users', 'utf8')
  try{
    users = JSON.parse(users) //[]
  }catch(exception){
    users = []
  }*/
  console.log('request.headers.cookie')
  console.log(request.headers.cookie)
  let cookies = request.headers.cookie.split(';')
  let hash = {}
  for(let i=0;i<cookies.length;i++){
    let parts = cookies[i].split('=')
    let key = parts[0]
    let value = parts[1]
    hash[key] = value
  }
  let email = hash.sign_in_email
  let users = fs.readFileSync('./db/users', 'utf8') //[{"email":"@","password":"1"}]
  users = JSON.parse(users) //[ { email: '@', password: '1' } ]
  let foundUser
  for(let i=0;i<users.length;i++){
    if(users[i].email === email){
      foundUser = users[i]
      break;
    }
  }
  console.log('foundUser')
  console.log(foundUser)
  console.log(foundUser.password)
  if(foundUser){
    string = string.replace('__password__', foundUser.password)
  }else{
    string = string.replace('__password__', '不知道')
  }
  response.statusCode = 200
  response.setHeader('Content-Type','text/html; charset=utf-8')
  response.write(string)
  response.end()
}else if(path === '/sign_up' && method === 'GET'){
  var string = fs.readFileSync('sign_up.html','utf8')
  response.statusCode = 200
  response.setHeader('Content-Type','text/html; charset=utf-8')
  response.write(string)
  response.end()
}else if(path === '/sign_up' && method === 'POST'){
  readBody(request).then((body) => {
    let strings = body.split('&')
    let hash = {}
    strings.forEach((string) => {
      let parts = string.split('=')
      let key = parts[0]
      let value = parts[1]
      hash[key] = decodeURIComponent(value) //decodeURIComponent 用于将@ 转换
    })
    let {email, password, password_confirmation} = hash
    if(email.indexOf('@') === -1){
      response.statusCode = 400
      response.setHeader('Content-Type','application/json; charset=utf-8')
      response.write(`{
        "errors":{
          "email": "invalid"
        }
      }`)
    }else if(password !== password_confirmation){
      response.statusCode = 400
      response.write('password is not same')
    }else{
      var users = fs.readFileSync('./db/users', 'utf8')
      try{
        users = JSON.parse(users) //[]
      }catch(exception){
        users = []
      }
      let inUse = false
      for(let i=0;i<users.length;i++){
        let user = users[i]
        if(user.email === email){
          inUse = true
          break;
        }
      }
      if(inUse){
        response.statusCode = 400
        response.write('email in use')
      }else{
        users.push({email: email, password: password})
        var usersString = JSON.stringify(users)
        fs.writeFileSync('./db/users', usersString)
        response.statusCode = 200
      }
    }
    response.end()
  })
}else if(path === '/sign_in' && method === 'GET'){
  var string = fs.readFileSync('sign_in.html','utf8')
  response.statusCode = 200
  response.setHeader('Content-Type','text/html; charset=utf-8')
  response.write(string)
  response.end()
}else if(path === '/sign_in' && method === 'POST'){
  readBody(request).then((body) => {
    let strings = body.split('&')
    let hash = {}
    strings.forEach((string) => {
      let parts = string.split('=')
      let key = parts[0]
      let value = parts[1]
      hash[key] = decodeURIComponent(value) //decodeURIComponent 用于将@ 转换
    })
    let {email, password} = hash
    console.log(email)
    console.log(password)
    var users = fs.readFileSync('./db/users', 'utf8')
    try{
      users = JSON.parse(users) //[]
    }catch(exception){
      users = []
    }
    let found
    for(let i=0;i<users.length;i++){
      if(users[i].email === email && users[i].password === password){
        found = true
        break;
      }
    }
    if(found){
      response.setHeader('Set-Cookie', `sign_in_email=${email}; HttpOnly`)
      response.statusCode = 200
    }else{
      response.statusCode = 401
    }
    response.end()
  })
}else if(path === '/main.js'){
  var string = fs.readFileSync('./main.js','utf8')
  response.statusCode = 200
  response.setHeader('Content-Type','text/javascript; charset=utf-8')
  response.write(string)
  response.end()
}else if(path === '/jQuery-ajax.js'){
  var string = fs.readFileSync('./jQuery-ajax.js','utf8')
  response.statusCode = 200
  response.setHeader('Content-Type','text/javascript; charset=utf-8')
  response.write(string)
  response.end()
}else if(path === '/promise.js'){
  var string = fs.readFileSync('./promise.js','utf8')
  response.statusCode = 200
  response.setHeader('Content-Type','text/javascript; charset=utf-8')
  response.write(string)
  response.end()
}else if(path === '/xxx'){
  response.statusCode = 200
  response.setHeader('Content-Type','text/json; charset=utf-8')
  response.setHeader('Access-Control-Allow-Origin','http://ry.com:8001')
  response.write(`
    {
      "note":{
        "to": "tove",
        "from": "Jani",
        "content": "Reminder",
        "body": "Don't forget me this weekend!"
      }
    }
  `)
  response.end()
}else{
  response.statusCode = 404
  response.setHeader('Content-Type', 'text/html;charset=utf-8')
  response.write(`
    {
      "error": "not found"
    }
  `)
  response.end()
}

  /******** 代码结束，下面不要看 ************/
})

function readBody(request){
  let body = []
  return new Promise((resolve, reject) => {
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

