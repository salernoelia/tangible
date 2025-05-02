use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    // alert(&format!("Hello, {}!", name));
    return;
}
#[wasm_bindgen]
pub fn add(num_one: i32, num_two: i32) -> i32 {
    num_one + num_two
}
