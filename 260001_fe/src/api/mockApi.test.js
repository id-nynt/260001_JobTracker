import { mockApi, startDemo } from './mockApi'

const { jobs, groups } = mockApi

const groupNamed = async (name) => (await groups.list()).find((group) => group.name === name)

beforeEach(() => {
  startDemo()
})

describe('demo store behaves like the real API', () => {
  it("calculates a group's job count and date range from its jobs as they change", async () => {
    const search = await groups.create('Test search')
    const january = await jobs.create({ companyName: 'A', jobTitle: 'Dev', dateApplied: '2026-01-10', periodId: search.id })
    const february = await jobs.create({ companyName: 'B', jobTitle: 'Dev', dateApplied: '2026-02-01', periodId: search.id })

    expect(await groupNamed('Test search')).toMatchObject({
      count: 2,
      dateStart: '2026-01-10T00:00:00.000Z',
      dateEnd: '2026-02-01T00:00:00.000Z'
    })

    const defaultGroup = await groupNamed('Default')
    await jobs.update(february.id, { periodId: defaultGroup.id })
    expect(await groupNamed('Test search')).toMatchObject({ count: 1, dateEnd: '2026-01-10T00:00:00.000Z' })

    await jobs.remove(january.id)
    expect(await groupNamed('Test search')).toMatchObject({ count: 0, dateStart: null, dateEnd: null })
  })

  it('stores the group id as a number even when it arrives as text from a <select>', async () => {
    const [job] = await jobs.list()
    const target = await groupNamed('Default')

    const moved = await jobs.update(job.id, { periodId: String(target.id) })

    expect(moved.periodId).toBe(target.id)
    expect((await groupNamed('Default')).count).toBe(1)
  })

  it("moves a deleted group's jobs to Default, and protects Default itself", async () => {
    const software = await groupNamed('2026_Software')
    const total = (await jobs.list()).length

    await groups.remove(software.id)

    expect((await jobs.list()).length).toBe(total)
    expect((await groupNamed('Default')).count).toBe(software.count)
    expect(await groupNamed('2026_Software')).toBeUndefined()

    const defaultGroup = await groupNamed('Default')
    await expect(groups.remove(defaultGroup.id)).rejects.toThrow('Cannot delete the default period')
    await expect(groups.rename(defaultGroup.id, 'Renamed')).rejects.toThrow('cannot be renamed')
  })

  it('rejects invalid input with the same messages as the API', async () => {
    await expect(jobs.create({ companyName: '  ', jobTitle: 'Dev', dateApplied: '2026-01-01' }))
      .rejects.toThrow('Company name cannot be empty')
    await expect(jobs.create({ companyName: 'A', jobTitle: 'Dev', dateApplied: '2999-01-01' }))
      .rejects.toThrow('cannot be in the future')
    await expect(groups.create('2026_Data')).rejects.toThrow('already exists')
    await expect(jobs.update(99999, { status: 'Offered' })).rejects.toThrow('Job application not found')
  })

  it('updates only the fields that are sent, and an empty string clears url and notes', async () => {
    const job = await jobs.create({
      companyName: 'Acme',
      jobTitle: 'Dev',
      dateApplied: '2026-01-10',
      jobUrl: 'https://acme.example',
      notes: 'Phone screen'
    })

    const afterStatus = await jobs.update(job.id, { status: 'Offered', notes: null })
    expect(afterStatus).toMatchObject({
      status: 'Offered',
      companyName: 'Acme',
      jobUrl: 'https://acme.example',
      notes: 'Phone screen'
    })

    const afterClear = await jobs.update(job.id, { jobUrl: '', notes: '' })
    expect(afterClear).toMatchObject({ jobUrl: null, notes: null, status: 'Offered' })
  })
})
