import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    // Test with simple strings
    expect(cn('class1', 'class2')).toBe('class1 class2')

    // Test with conditional classes
    expect(cn('base-class', true && 'conditional-class')).toBe(
      'base-class conditional-class'
    )
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class')

    // Test with object notation
    expect(cn('base-class', { 'conditional-class': true })).toBe(
      'base-class conditional-class'
    )
    expect(cn('base-class', { 'conditional-class': false })).toBe('base-class')

    // Test with complex combinations
    expect(
      cn(
        'always-included',
        { 'included-true': true, 'included-false': false },
        ['array-item1', 'array-item2'],
        undefined,
        null,
        false && 'shouldnt-be-included'
      )
    ).toBe('always-included included-true array-item1 array-item2')
  })

  it('should merge Tailwind utility classes correctly', () => {
    // Test Tailwind's utility class conflict resolution
    expect(cn('p-4', 'p-8')).toBe('p-8')
    expect(cn('text-red-500', 'text-blue-700')).toBe('text-blue-700')

    // Test with variant combinations - order may vary based on tailwind-merge implementation
    const result = cn('text-sm md:text-lg', 'text-base')
    expect(result.includes('text-base')).toBe(true)
    expect(result.includes('md:text-lg')).toBe(true)
    expect(result.includes('text-sm')).toBe(false)

    // Test with responsive variants and state variants
    const complexResult = cn(
      'bg-blue-500 hover:bg-blue-700',
      'bg-red-500',
      'sm:bg-green-500 md:bg-yellow-500'
    )

    // Verify expected classes are present without depending on order
    expect(complexResult.includes('hover:bg-blue-700')).toBe(true)
    expect(complexResult.includes('bg-red-500')).toBe(true)
    expect(complexResult.includes('sm:bg-green-500')).toBe(true)
    expect(complexResult.includes('md:bg-yellow-500')).toBe(true)

    // Verify overridden class is not present
    expect(complexResult.includes('bg-blue-500')).toBe(false)
  })
})
