const fs = require('fs');

//
//  HELPERS
//

const copy = items => [...items];

// https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array
const randIndex = items => Math.floor(Math.random()*items.length);
const randEl = items => items[randIndex(items)];

const swap_inplace = (items, i, j) => {
  const temp = items[i];
  items[i] = items[j];
  items[j] = temp;
}

const scramble_inplace = items => {
  for(let i = 0; i < items.length; i++){
    const j = randIndex(items);
    swap_inplace(items, i, j);
  }
}

const scramble = items => {
  const items_copy = copy(items);
  scramble_inplace(items_copy);
  return items_copy;
}

const toCharCode = char => {
  return char.charCodeAt(0);
}

const getCircle = (items, i) => {
  return items[i%items.length];
}

//
//  TABLE
//

const getDecryptr_table = charset => {
  const rows = scramble(charset);
  const cols = scramble(charset);
  const decryptr = {};

  for(let i = 0; i < rows.length; i++){
    const fill = scramble(charset);
    for(let j = 0; j < cols.length; j++){
      const k = `${rows[i]}${cols[j]}`;
      decryptr[k] = fill[j];
    }
  }

  return decryptr;
}

const getEncryptr_table = decryptr => {
  const keys = Object.keys(decryptr);
  const encryptr = {};

  for(let i = 0; i < keys.length; i++){
    const k = keys[i];
    const v = decryptr[k];
    if(encryptr.hasOwnProperty(v)){
      encryptr[v].push(k);
    } else {
      encryptr[v] = [k];
    }
  }

  return encryptr;
}

const encrypt_table = (str, decryptr) => {
  const encryptr = getEncryptr_table(decryptr);
  let encryption = "";
  
  for(let i = 0; i < str.length; i++){
    const char = str[i];
    const char_encrypted = randEl(encryptr[char]);
    encryption += char_encrypted;
  }

  // add parenthesis for clear copy&paste
  return encryption;
}

const decrypt_table = (str, decryptr) => {
  let decryption = "";

  for(let i = 0; i < str.length; i+=2){
    const k = `${str[i]}${str[i+1]}`;
    decryption += decryptr[k];
  }

  return decryption;
}

//
//  CONST
//

const getEncryptr_const = charset => {
  return scramble(charset);
}

const encrypt_const = (str, encryptr) => {
  let encrypted = "";
  for(let i = 0; i < str.length; i++){
    const char = str[i];
    const modifier = getCircle(encryptr, i);
    const char_encrypted = String.fromCharCode(toCharCode(char) + toCharCode(modifier));
    encrypted += char_encrypted;
  }
  return encrypted;
}

const decrypt_const = (str, encryptr) => {
  let decrypted = "";
  for(let i = 0; i < str.length; i++){
    const char = str[i];
    const modifier = getCircle(encryptr, i);
    const char_decrypted = String.fromCharCode(toCharCode(char) - toCharCode(modifier));
    decrypted += char_decrypted;
  }
  return decrypted;
}

//
//  TOGETHER
//

const genEncryptrs = charset => {
  const encryptrs_const = [];
  for(let i = 0; i < 9; i++){
    encryptrs_const.push(getEncryptr_const(charset));
  }

  return {
    table: getDecryptr_table(charset),
    const: encryptrs_const,
  }
}

const encrypt = (str, encryptrs, pin=[]) => {
  let str_copy = "" + str;
  
  // apply table encryption
  const table = encryptrs.table;
  str_copy = encrypt_table(str_copy, table);

  // apply const encryption
  const consts = encryptrs.const;
  for(let i = 0; i < pin.length; i++){
    encryptr = consts[i];
    str_copy = encrypt_const(str_copy, encryptr);
  }

  // parenthesis for easy copy paste
  str_copy = `(${str_copy})`;

  return str_copy;
}

const decrypt = (str, encryptrs, pin=[]) => {
  // remove parenthesis
  let str_copy = str.slice(1, str.length-1);

  // reverse const encryption
  const consts = encryptrs.const;
  for(let i = pin.length-1; i >= 0; i--){
    encryptr = consts[i];
    str_copy = decrypt_const(str_copy, encryptr);
  }

  // reverse table encryption
  const table = encryptrs.table;
  str_copy = decrypt_table(str_copy, table);

  return str_copy;
}

//
//  TEST HELPERS
//

const getAsciiArr = () => {
  s = "";
  for(var i = 32; i < 127; i++) {
    s += String.fromCharCode(i);
  }
  return s.split("");
}

const CHARSET = getAsciiArr();
const templateUrl = "key.html";
const outUrl = "keys/key"+Date.now().toString()+".html";
const crypts = JSON.stringify(genEncryptrs(CHARSET));

const template = fs.readFileSync(templateUrl, {encoding: "utf8"});
//const templateKeyed = template.replace("{PUTKEYHERE}", crypts);
const template_split = template.split("{PUTKEYHERE}");
const templateKeyed = template_split[0] + crypts + template_split[1];

fs.writeFileSync(outUrl, templateKeyed);