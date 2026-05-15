export type ApiParam = {
  name: string
  type: string
  required: boolean
  description: string
}

export type ApiDoc = {
  key: string
  category: 'Bank' | 'PAN' | 'Aadhaar' | 'Company' | 'DL' | 'RC' | 'Voter'
  name: string
  method: 'POST'
  endpoint: string
  description: string
  requirements: string[]
  params: ApiParam[]
  request: string
  response: string
  example: string
}