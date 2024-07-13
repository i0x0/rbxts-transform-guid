import { v4 } from "uuid";
import Hashids from "hashids";
import { TransformState, UUIDGenerationType } from "./transformState";
import ts from "typescript";
import chalk from "chalk";
import { createHash } from "crypto";  // Import the crypto module for hashing

const hashids = new Hashids();

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGuid() {
  const len = getRndInteger(5, 16);
  const iterations = getRndInteger(2, 5);
  let value = "";

  for (let i = 0; i < iterations; i++) {
    value += Math.random().toString(36).substring(2, len);
  }

  const noNumbers = value.replace(/[0-9]/g, "");
  const randomCaps = noNumbers
    .toLowerCase()
    .split("")
    .map(function (c) {
      return Math.random() < 0.85 ? c : c.toUpperCase();
    })
    .join("");

  return randomCaps;
}

function consistentUuid(label: string): string {
  const hash = createHash('sha256').update(label).digest('hex');
  // Form the UUID from the hash
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

export class GUIDProvider {
  private labels = new Map<string, string>();

  public constructor(private readonly transformState: TransformState) {}

  public hasStringForConstLabel(label: string) {
    return this.labels.has(label);
  }

  public getGenerationTypeForEnum(
    enumerable: ts.EnumDeclaration,
    elseGenerationType: UUIDGenerationType
  ): UUIDGenerationType | undefined {
    const docTags = ts.getJSDocTags(enumerable);
    for (const tag of docTags) {
      if (tag.tagName.text === "uuid") {
        if (
          typeof tag.comment === "string" &&
          ["hashids", "guidv4", "string", "consistent"].includes(tag.comment)
        ) {
          return tag.comment as UUIDGenerationType;
        }

        return elseGenerationType;
      }
    }
  }

  public getStringForConstLabel(
    label: string,
    labelKind: UUIDGenerationType
  ): string {
    if (this.labels.has(label)) {
      return this.labels.get(label)!;
    } else {
      switch (labelKind) {
        case "guidv4":
          const uuidV4 = v4();
          this.labels.set(label, uuidV4);
          this.transformState.logger.infoIfVerbose(
            `Generate ${chalk.yellow("GUIDv4")} ${chalk.cyan(uuidV4)} for ${chalk.magenta(label)}`
          );
          return uuidV4;
        case "string":
          const uuidString = generateGuid();
          this.labels.set(label, uuidString);
          this.transformState.logger.infoIfVerbose(
            `Generate ${chalk.yellow("string")} ${chalk.green(`"${uuidString}"`)} for ${chalk.magenta(label)}`
          );
          return uuidString;
        case "hashids":
          const uuidHashid = hashids.encode(this.labels.size, new Date().getTime());
          this.labels.set(label, uuidHashid);
          this.transformState.logger.infoIfVerbose(
            `Generate ${chalk.yellow("hashid")} ${chalk.green(`"${uuidHashid}"`)} for ${chalk.magenta(label)}`
          );
          return uuidHashid;
        case "consistent":
          const uuidConsistent = consistentUuid(label);
          this.labels.set(label, uuidConsistent);
          this.transformState.logger.infoIfVerbose(
            `Generate ${chalk.yellow("consistent UUID")} ${chalk.green(`"${uuidConsistent}"`)} for ${chalk.magenta(label)}`
          );
          return uuidConsistent;
        default:
          throw new Error(`Unsupported label kind: ${labelKind}`);
      }
    }
  }
}
