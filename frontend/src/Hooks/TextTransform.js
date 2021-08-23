//for storing names in capital letter
export function capitalize(string) {
    if(string !== null || string !== "") { 
        console.log('Name added is capitalized') 
       return string.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' '); 
    }
    else
        return string
}
//splitting 0 from phone number 
export function numberFormat(string) {
    if (string !==null && string.charAt(0)==='0'){
        console.log('Phone number added is sliced')
        return string.slice(1)
    }
    else
    return string
}