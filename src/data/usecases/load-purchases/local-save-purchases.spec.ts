import { LocalLoadPurchases } from '@/data/usecases';
import { mockPurchases } from '@/data/tests/mock-purchases';
import { CacheStoreSpy } from '@/data/tests';

type SutTypes = {
  sut: LocalLoadPurchases
  cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()): SutTypes => {
  const cacheStore = new CacheStoreSpy()
  const sut = new LocalLoadPurchases(cacheStore, timestamp)
  return { sut, cacheStore }
}

describe('LocalSavePurchases', () => {
  it('should not delete or insert cache on sut.init', () => {
    const { cacheStore } = makeSut()
    expect(cacheStore.actions).toEqual([])
  })

  it('should not insert new cache if delete fails', async () => {
    const { sut, cacheStore } = makeSut()
    cacheStore.simulateDeleteError()
    const promise = sut.save(mockPurchases())
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.delete,
    ])
    await expect(promise).rejects.toThrow()
  })

  it('should insert new cache if delete succeeds', async () => {
    const timestamp = new Date()
    const { sut, cacheStore } = makeSut(timestamp)
    const purchases = mockPurchases()
    const promise = sut.save(purchases)
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.delete,
      CacheStoreSpy.Action.insert
    ])
    expect(cacheStore.insertKey).toBe('purchases')
    expect(cacheStore.deleteKey).toBe('purchases')
    expect(cacheStore.insertValues).toEqual({
      timestamp,
      value: purchases
    })
    await expect(promise).resolves.toBeFalsy()
  })

  it('should throw if insert throws', async () => {
    const { sut, cacheStore } = makeSut()
    cacheStore.simulateInsertError()
    const promise = sut.save(mockPurchases())
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.delete,
      CacheStoreSpy.Action.insert
    ])
    await expect(promise).rejects.toThrow()
  })
})
