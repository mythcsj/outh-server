export function getQueryString(url: string, key: string) {
    var reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)');
    var result = url.slice(1).match(reg);
    return result ? decodeURIComponent(result[2]) : null;
}
