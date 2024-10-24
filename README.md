GUID
=====
Hi Boogle here, I changed some stuff regarding this so that it could generate consistent UUID's which is useful for stuff like item IDs and what not.

Compile-time GUID generation library. This can be used for networking remote purposes, or for general compile-time hash requirements.

Using "consistent" will now make all the UUIDs the same based off their Enum name, so these stay the same every time you compile.
```ts
/**
 * @uuid consistent
 */
export const enum UUID {
    A, // 561e7af8-da76-4c27-9cd9-3fcc667aa632
    B, // 6d1fdda0-b1cd-4db4-b960-7002ce34e0f4
    C // 7c169ce3-2ecc-4af6-9733-c16e3587a4ef
}
```

(99% of this was written by ChatGPT, so it's probably ASS! But it does what I need, and without too much issue)

The rest of this readme is the same from the other project

## Usage
This transformer makes use of the `uuid` jsdoc tag. By default it will use `hashids` for the generated strings. 




```ts
/**
 * @uuid
 */
export const enum UUID {
    A = "Test",
    B = "Test2",
    C = "Test3"
}
```

So now
```ts
/**
 * @uuid
 */
export const enum UUID {
    A = "Test",
    B = "Test2",
    C = "Test3"
}

const test = UUID.A;
```
which will compile to
```lua
local test = "TDr8PURNna"
```

## Macros
### `debugUUIDs` `<T>`
Will reverse hashed enums, e.g.

```ts
/**
 * @uuid
 */
export const enum Test {
  RemoteName1 = "SomethingGoesHereLol",
  RemoteName2 = "AnotherThingGoesHere",
}

const uuids = $debugUUIDs<typeof Test>(); // NOTE: MUST BE `typeof EnumNameHere`.
```

```lua
local uuids = {
	["9QiYxp4Qy60"] = "RemoteName1",
	["0Ysr4LNVO9x"] = "RemoteName2",
}
```

## Configuration
### `verbose: boolean`
Whether or not the transformer's output is verbose, this can also be toggled using `--verbose` to rbxtsc.
### `generateEnumUUIDs: boolean`
Whether or not to generate the UUIDs on compile - will default to true, overridden by `environments`.
### `environments: string[]`
The environments this transformer will run the generators on - defaults to `production`.
### `generationType: UUIDGenerationType`
The type of strings to generate per UUID use - This can be `hashids`, `uuidv4` or `string`.
