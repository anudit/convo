export default function timeAgo(time) {
    switch (typeof time) {
      case "number":
        break;
      case "string":
        if(time.length <= "10"){
          time = time+"000";
        }
        time = +new Date(parseInt(time));
        break;
      case "object":
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = +new Date();
    }
    var time_formats = [
      [60, "s", 1], // 60
      [120, "1min ago", "1 minute from now"], // 60*2
      [3600, "mins", 60], // 60*60, 60
      [7200, "1hr ago", "1 hour from now"], // 60*60*2
      [86400, "h", 3600], // 60*60*24, 60*60
      [172800, "Yesterday", "Tomorrow"], // 60*60*24*2
      [604800, "d", 86400], // 60*60*24*7, 60*60*24
      [1209600, "Last week", "Next week"], // 60*60*24*7*4*2
      [2419200, "w", 604800], // 60*60*24*7*4, 60*60*24*7
      [4838400, "Last month", "Next month"], // 60*60*24*7*4*2
      [29030400, " mths", 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      [58060800, "Last yr", "Next year"], // 60*60*24*7*4*12*2
      [2903040000, "yrs", 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
      [5806080000, "Last century", "Next century"], // 60*60*24*7*4*12*100*2
      [58060800000, "centuries", 2903040000], // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var seconds = (+new Date() - time) / 1000,
      token = "ago",
      list_choice = 1;

    if (seconds == 0) {
      return "Just now";
    }
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = "from now";
      list_choice = 2;
    }
    var i = 0,
      format;
    while ((format = time_formats[i++]))
      if (seconds < format[0]) {
        if (typeof format[2] == "string") return format[list_choice];
        else
          return Math.floor(seconds / format[2]) + format[1] + " " + token;
      }
    return time;
  }
