module.exports=function(){
    var WordsLIB=[
        "sb","傻逼","沙比","啥比",'萨比',"撒币","洒币",
        "狗","猪","dog",
        "儿子","爸爸","son","Son","parent","Parent","mother","Mother","妈","尼玛",
        "fuck","Fuck","操","死",
        "贱",
        "逼",'批',"批",
        "QQ","qq","+q","+Q","扣扣",
        "wx","WX","微信","WeChat","+wei","+Wei","weixin"
    ];
    this.haveSensitiveWord=function haveSensitiveWord(StringA)
    {
    for(var i=0;i<WordsLIB.length;i++)
        if(StringA.indexOf(WordsLIB[i])!=-1)//不等于-1表示含有敏感词汇
            return true;
    return false;
    }// indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。如果要检索的字符串值没有出现，则该方法返回 -1。
    var NumLIB=[
    "0","1","2","3","4","5","6","7","8","9"
    ];
    this.haveNumber=function haveNumber(StringA)//其实应该在服务端检测
    {
    for(var i=0;i<NumLIB.length;i++)
        if(StringA.indexOf(NumLIB[i])!=-1)//不等于-1表示含有敏感词汇
            return true;
    return false;
    }
}
