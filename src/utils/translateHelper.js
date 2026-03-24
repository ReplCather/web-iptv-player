import { translate as _translate } from '../api/translate'

export async function translate(input) {
  const result = await _translate(input)
  return result
}
