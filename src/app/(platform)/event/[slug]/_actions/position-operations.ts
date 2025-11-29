'use server'

import { z } from 'zod'
import {
  COLLATERAL_TOKEN_ADDRESS,
  CONDITIONAL_TOKENS_CONTRACT,
  DEFAULT_CONDITION_PARTITION,
  DEFAULT_ERROR_MESSAGE,
  ZERO_COLLECTION_ID,
} from '@/lib/constants'
import { UserRepository } from '@/lib/db/queries/user'
import { toMicro } from '@/lib/formatters'
import { buildClobHmacSignature } from '@/lib/hmac'

const amountSchema = z.preprocess((value) => {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '')
    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return value
}, z.number().positive('Enter an amount greater than zero.'))

const positionOperationSchema = z.object({
  conditionId: z.string().min(1, 'Market context is missing. Please try again.'),
  amount: amountSchema,
  partition: z.array(z.string()).min(1).optional(),
})

type PositionOperationInput = z.input<typeof positionOperationSchema>

interface OperationResult {
  error?: string
  txHash?: string
}

async function submitPositionOperation(
  path: '/operations/split-position' | '/operations/merge-position',
  input: PositionOperationInput,
): Promise<OperationResult> {
  const user = await UserRepository.getCurrentUser()
  if (!user) {
    return { error: 'Please connect your wallet to continue.' }
  }

  const parsed = positionOperationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? DEFAULT_ERROR_MESSAGE,
    }
  }

  const partition = parsed.data.partition ?? Array.from(DEFAULT_CONDITION_PARTITION)
  const payload = {
    contract: CONDITIONAL_TOKENS_CONTRACT,
    collateral_token: COLLATERAL_TOKEN_ADDRESS,
    condition_id: parsed.data.conditionId,
    parent_collection_id: ZERO_COLLECTION_ID,
    partition,
    amount: toMicro(parsed.data.amount),
  }

  const relayerUrl = process.env.RELAYER_URL
  if (!relayerUrl) {
    return { error: DEFAULT_ERROR_MESSAGE }
  }

  const method = 'POST'
  const body = JSON.stringify(payload)
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = buildClobHmacSignature(
    process.env.FORKAST_API_SECRET!,
    timestamp,
    method,
    path,
    body,
  )

  try {
    const response = await fetch(`${relayerUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'FORKAST_ADDRESS': process.env.FORKAST_ADDRESS!,
        'FORKAST_API_KEY': process.env.FORKAST_API_KEY!,
        'FORKAST_PASSPHRASE': process.env.FORKAST_PASSPHRASE!,
        'FORKAST_TIMESTAMP': timestamp.toString(),
        'FORKAST_SIGNATURE': signature,
      },
      body,
      signal: AbortSignal.timeout(15000),
    })

    let responseJson: any = null
    try {
      responseJson = await response.json()
    }
    catch {
      responseJson = null
    }

    if (!response.ok) {
      const message = typeof responseJson?.error === 'string'
        ? responseJson.error
        : typeof responseJson?.message === 'string'
          ? responseJson.message
          : DEFAULT_ERROR_MESSAGE
      return { error: message }
    }

    const txHash = typeof responseJson?.txHash === 'string' ? responseJson.txHash : undefined
    return { txHash }
  }
  catch (error) {
    console.error(`Failed to call relayer operation ${path}.`, error)
    return { error: DEFAULT_ERROR_MESSAGE }
  }
}

export async function splitPositionAction(input: PositionOperationInput): Promise<OperationResult> {
  return submitPositionOperation('/operations/split-position', input)
}

export async function mergePositionAction(input: PositionOperationInput): Promise<OperationResult> {
  return submitPositionOperation('/operations/merge-position', input)
}
