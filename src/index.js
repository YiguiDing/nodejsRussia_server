// const host = "127.0.0.1";
const hostname = "0.0.0.0";
const port = 54321;
const historyScoreFilePath=process.cwd()+"/data/historyScore.json";//保存了要发给客户端的数据
const historyScoreTempFilePath=process.cwd()+"/data/historyScoreTemp.json";//保存了从客户端记录的所有数据
const default_listCount=12;//排名记录前12

//使用ws模块创建wss服务器:
var https=require('https');
var ws=require('ws');
var fs=require('fs');
const { send } = require('process');

var keypath=process.cwd()+'/Key/scs1642181627610_hostname.ltd_server.key';//私钥 console.log(keypath);
var certpath=process.cwd()+'/Key/scs1642181627610_hostname.ltd_server.crt';//证书 console.log(certpath);

var httpsOptions = {
  key:  fs.readFileSync(keypath),
  cert: fs.readFileSync(certpath),
  //passphrase:'1234'//如果秘钥文件有密码的话，用这个属性设置密码
};
var httpsServer=https.createServer(httpsOptions, function (req, res) {//对直接访问https服务403禁止
    res.writeHead(403);//禁止访问网页 200成功 403禁止
    res.end("This is a  WebSockets server!\n");
});
httpsServer.listen(port,hostname,()=>{
    console.log('Server running at https://'+ hostname + ':' + port + '/')
});

var WSSoption={
    // host:hostname,
    // port:port,
    server: httpsServer,//把创建好的https服务器丢进websocket的创建函数里，ws会用这个服务器来创建wss服务//如果丢进去的是个http服务的话那么创建出来的还是无加密的ws服务
    clientTracking:true,
}
var wss = new ws.Server(WSSoption,()=>{
    console.log("wss服务创建成功~");
});

var CLIENTS=[];//用于广播消息
wss.on( 'connection', processClientEvents);             

function processClientEvents(socket,request)                //对单个ws会话连接的处理程序
{
    CLIENTS.push(socket);
    console.log("与新用户建立了连接,当前连接数:" + wss.clients.size);
    // console.log("会话ID(sessionIdContext):"+ socket["_socket"]["server"]["sessionIdContext"]);

    socket.on( 'message', processReceiveWsMessage);         //绑定收到消息后执行的操作
    socket.on( 'close' ,  processWsCloseEvent);             //绑定断开连接后执行的操作

    // boradcastMessage("这是一条广播消息:服务器上的人数增加了");
}
function processReceiveWsMessage(data,isBinary)//处理从客户端收到的消息
{
    try
    {
        //javaScript对象 -> JSON.stringify -> 字符串 -> data[Buffer] -> toString()字符串 -> JSON.parse() -> javaScript对象
        console.log(data);
        if(data.toString()=="")
        {
            console.log("收到异常数据:"+data.toString());
            return;
        }

        var clientJsOBJ=JSON.parse(data.toString());
        if(clientJsOBJ["requestType"]=="请求排行榜数据")
        {
            // var request={//客户端发来的数据对象格式
            //     requestType:"请求排行榜数据",
            //     data:{
                    
            //     }
            // };
            console.log("客户端请求排行榜数据");
            var sendDataString=fs.readFileSync(historyScoreFilePath).toString();
            this.send(sendDataString);
        }
        if(clientJsOBJ["requestType"]=="请求记录玩家得分")
        {
            console.log("客户端请求记录玩家得分");
            // var date={//客户端发送的数据格式
            //     requestType:"请求记录玩家得分",
            //     data:{
            //         mode:gameMode,
            //         addData:{
            //             name:playerName,
            //             score:score
            //         }
            //     }
            // }
            var clientMode=clientJsOBJ["data"]["mode"];//获取客户端当前游戏模式
            var clientName=clientJsOBJ["data"]["addData"]["name"];
            var clientScore=clientJsOBJ["data"]["addData"]["score"];

            if(clientMode!="经典模式" && clientMode!="加速模式" && clientMode!="困难模式" && clientMode!="限时模式")
                return;//如果不是这几种模式就不处理
            var LocalDatajsOBJ=JSON.parse(fs.readFileSync(historyScoreFilePath).toString())//将本地数据抽象为js对象
            var LocalTempDatajsOBJ=JSON.parse(fs.readFileSync(historyScoreTempFilePath).toString())//将另一个本地数据抽象为js对象
            
            function sameName(){
                for(var i=0;i<LocalDatajsOBJ[clientMode].length;i++)//遍历判断是否有同名的人
                {
                    if(LocalDatajsOBJ[clientMode][i]["name"]==clientName)//如果有直接修改得分
                    {    
                        LocalDatajsOBJ[clientMode][i]["score"]=clientScore;
                        return true;
                    }
                    return false;
                }
            }
            if(!sameName())//没有相同的姓名时执行添加数据
                LocalDatajsOBJ[clientMode].push(clientJsOBJ["data"]["addData"]);//将用户数据（得分情况）添加到列表1
            LocalTempDatajsOBJ[clientMode].push(clientJsOBJ["data"]["addData"]);//将用户数据（得分情况）添加到列表2 因为要对表一排序并只保留前十的数据，表二的数据不排序也不删

            LocalDatajsOBJ[clientMode].sort(function(obj1,obj2){return obj2["score"]-obj1["score"]});//根据得分降序排序
            while(LocalDatajsOBJ[clientMode].length>default_listCount)//仅存储前几条的数据
                var temp=LocalDatajsOBJ[clientMode].pop();//删除排名最低的
            fs.writeFileSync(historyScoreFilePath,JSON.stringify(LocalDatajsOBJ));//将结果写入文件
            fs.writeFileSync(historyScoreTempFilePath,JSON.stringify(LocalTempDatajsOBJ));//将结果写入文件
            console.log(fs.readFileSync(historyScoreFilePath).toString());//本地结果
            // jsOBJ["data"][]
            // var historyScoreList=fs.readFileSync(historyScoreFilePath).toString();
            // this.send(sendDataString);
            // console.log(typeof fs.readFileSync(historyScoreFilePath));//object
            // console.log(fs.readFileSync(historyScoreFilePath));//byte字节数据
            // console.log(fs.readFileSync(historyScoreFilePath).toString());//字符串数据
            // console.log(LocalDatajsOBJ[clientMode]);//排序后的结果，将会多一项
            // console.log(LocalDatajsOBJ[clientMode]);//结果


        }
    }catch(err)
    {
        console.error("error:"+err);
    }
        
}
function processWsCloseEvent(data,isBinary)//处理从客户端收到的消息
{
    CLIENTS.splice(CLIENTS.indexOf(this),1);//搜索并删除CLIENTS中的某元素
    console.log("与客户端断开连接");
}
function boradcastMessage(date)//广播消息
{
    for(var i=0;i<CLIENTS.length;i++)
    CLIENTS[i].send(date);
}
