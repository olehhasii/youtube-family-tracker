import { describe, expect, test } from 'vitest'
import { memberSlug } from '../slug'

describe('memberSlug', () => {
  test('lowercases Latin names and joins words with hyphens', () => {
    expect(memberSlug('Oleh', [])).toBe('oleh')
    expect(memberSlug('  Mary Jane  ', [])).toBe('mary-jane')
  })

  test('transliterates Ukrainian by the official 2010 rules', () => {
    expect(memberSlug('Олег', [])).toBe('oleh')
    expect(memberSlug('Щербина', [])).toBe('shcherbyna')
    expect(memberSlug('Ґанна Жук', [])).toBe('ganna-zhuk')
    expect(memberSlug('Наталія', [])).toBe('nataliia')
    expect(memberSlug('Дар’я', [])).toBe('daria')
  })

  test('є, ї, й, ю, я start a word as ye, yi, y, yu, ya', () => {
    expect(memberSlug('Юлія', [])).toBe('yuliia')
    expect(memberSlug('Яна', [])).toBe('yana')
    expect(memberSlug('Євген', [])).toBe('yevhen')
    expect(memberSlug('Їжак', [])).toBe('yizhak')
    expect(memberSlug('Йосип', [])).toBe('yosyp')
    expect(memberSlug('Андрій', [])).toBe('andrii')
  })

  test('drops what is neither a letter nor a digit', () => {
    expect(memberSlug('Sasha (brother) #2', [])).toBe('sasha-brother-2')
    expect(memberSlug('Мама 💜', [])).toBe('mama')
  })

  test('falls back to "member" when nothing is left', () => {
    expect(memberSlug('💜💜', [])).toBe('member')
  })

  test('adds -2, -3… when the slug is taken', () => {
    expect(memberSlug('Sasha', ['sasha'])).toBe('sasha-2')
    expect(memberSlug('Саша', ['sasha', 'sasha-2'])).toBe('sasha-3')
  })
})
