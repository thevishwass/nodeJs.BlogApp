console.log("TOP");

async function hello() {
    console.log("first");
}
hello();

console.log("Second");

async function hello2() {
    console.log("Third");
}
hello2();

let num = 0;

const app = setInterval(() => {
    num++;
    console.log("count:", num)
    if(num>=5){
        clearInterval(app);
    }
}, 1000);

console.log("Last");
