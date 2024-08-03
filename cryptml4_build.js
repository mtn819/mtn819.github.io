const fs = require('fs');

/*
CONFIG
*/

// INPUT_FILE :: String
const INPUT_FILE = "cryptml4_raw.html";

// OUTPUT_FILE :: String
const OUTPUT_FILE = "cryptml4.html";

// TARGET_KEY :: RegExp
const TARGET_KEY = /const KEY = \[.*\]\;/;

// SPACE :: Int
const SPACE = 69;

// PRINT :: Bool
const PRINT = true;

// TEST :: Bool
const TEST = true;

/*
KEY
*/

// is_prime :: Int -> Bool
const is_prime = x =>
{
    if(x === 2) return true;

    const sqrt = Math.sqrt(x);

    for(let i = 3; i <= sqrt; i += 2)
    {
        if(x % i === 0)
        {
            return false;
        }
    }
    
    return true;
}

// get_primes :: Int -> [Int]
const get_primes = length =>
{
    if(length <= 0) return [];
    
    const primes = [2];

    for(let i = 3; primes.length < length; i+=2)
    {
        if(is_prime(i))
        {
            primes.push(i);
        }
    }

    return primes;
}

// replicate :: Int -> (() -> a) -> [a]
const replicate = n => f =>
{
    const r = [];

    for(let i = 0; i < n; i++)
    {
        r.push(f());
    }

    return r;
}

// rand_int :: () -> Int
const rand_int = () =>
{
    const space = SPACE || 10;

    let r;

    r = Math.random();
    r *= space;
    r = Math.floor(r);

    return r;
}

// new_key :: () -> [[Int]]
const new_key = () =>
{
    const row_count = SPACE || 10;
    const row_lengths = get_primes(row_count);

    const r = [];

    for(let i = 0; i < row_count; i++)
    {
        const length = row_lengths[i];
        const row = replicate(length)(rand_int);

        r.push(row);
    }

    return r;
}

/*
FILE
*/

// populate_key :: [[Int]] -> RegExp -> String -> String
const populate_key = key => target_key => file_text =>
{
    let r;

    r = JSON.stringify(key);
    r = `const KEY = ${r};`;
    r = file_text.replace(target_key, r);

    return r;
};

/*
TEST
*/

// print :: (...a) -> ()
const print = (...xs) =>
{
    if(PRINT) console.log(...xs);
}

// arrays_eq :: [a] -> [a] -> Bool
const arrays_eq = xs => ys =>
{
    return JSON.stringify(xs) === JSON.stringify(ys);
}

// assert :: (() -> Bool) -> ()
const assert = f =>
{
    const result = f();
    if(result === undefined)
    {
        console.log(`ASSERTION UNDEFINED:\n${f}`);
    }
    if(result === false)
    {
        console.log(`ASSERTION FAILED:\n${f}`);
    }
}

// test :: () -> ()
const test = () =>
{
    // assert
    assert(() => 1 + 1 === 2);

    // arrays_eq
    assert(() => arrays_eq([1, 2])([1, 2]));
    assert(() => !arrays_eq([1])([]));

    // is_prime
    assert(() => is_prime(2));
    assert(() => is_prime(11));
    assert(() => !is_prime(12));

    // get_primes
    assert(() => arrays_eq([])(get_primes(0)));
    assert(() =>
    {
        const expected = [2, 3, 5, 7, 11];
        const observed = get_primes(5);

        return arrays_eq(expected)(observed);
    });

    // replicate
    assert(() =>
    {
        const f = () => 10;
        const n = 2;

        const expected = [10, 10];
        const observed = replicate(n)(f);

        return arrays_eq(expected)(observed);
    });

    // rand_int
    print(`rand_int: ${rand_int()}`);

    // new_key
    (() =>
    {
        const key = new_key().slice(0, 2);

        print(`new_key: ${JSON.stringify(key)}`);
    })();
}

/*
EXECUTE
*/

// main :: () -> ()
const main = () =>
{
    let r;

    r = fs.readFileSync(INPUT_FILE, {encoding: "utf8"});
    r = populate_key(new_key())(TARGET_KEY)(r);

    fs.writeFileSync(OUTPUT_FILE, r);
}

if(require.main === module)
{
    if(TEST)
    {
        test();
    }
    main();
}