export default function sleep (time = 1000): Promise<void> {
  return new Promise(s => setTimeout(s, time))
}
