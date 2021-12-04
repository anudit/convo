export default {
  stringToHex(str) {
      return unescape(encodeURIComponent(str))
        .split('').map(function(v){
          return v.charCodeAt(0).toString(16)
        }).join('')
  }
}