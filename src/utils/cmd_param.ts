import { StringObject } from '../types/common';

export default function cmdParam (getKey?: string): StringObject | string {
  const res: StringObject = {}
  const argv: string[] = process.argv
  if (argv && argv.length) {
    process.argv.forEach((arg: string) => {
      if (arg && /^\-\-.+/.test(arg)) {
        const [key, value] = arg.replace(/\-\-/, '').split('=')
        res[key] = value
      }
    })
  }
  return getKey ? res[getKey] : res
}
