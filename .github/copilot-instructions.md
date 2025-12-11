# GitHub Copilot Instructions for Panchanga-TS

## Project Overview

Panchanga-TS (`@alliumlabs/panchanga-ts`) is a TypeScript library for Hindu calendar (Panchanga) calculations. It computes various astronomical and astrological elements including:

- **Tithi**: Lunar day based on moon phase
- **Nakshatra**: Lunar mansion (27 divisions of the zodiac)
- **Yoga**: Auspicious combination of sun and moon
- **Karana**: Half of a tithi
- **Vaara**: Day of the week
- **Masa**: Lunar month
- **Ritu**: Season (6 seasons in Hindu calendar)
- **Samvatsara**: Year in the 60-year cycle
- **Ahargana**: Day count since Kali Yuga epoch
- **Sun times**: Sunrise and sunset calculations

The library requires `astronomy-engine` (peer dependency) for astronomical calculations and `moment-timezone` (peer dependency) for timezone handling. These must be installed by the consuming application.

## Directory Structure

```
panchanga-ts/
├── src/
│   ├── index.ts              # Main entry point and calculatePanchanga function
│   ├── calculations/         # Core calculation functions
│   │   ├── tithi.ts         # Lunar day calculations
│   │   ├── nakshatra.ts     # Lunar mansion calculations
│   │   ├── yoga.ts          # Yoga calculations
│   │   ├── karana.ts        # Karana calculations
│   │   ├── masa.ts          # Lunar month calculations
│   │   ├── year.ts          # Year cycle calculations
│   │   ├── time.ts          # Sunrise/sunset calculations
│   │   └── index.ts         # Exports all calculation functions
│   ├── models/              # TypeScript types and interfaces
│   │   └── types.ts         # Type definitions for inputs/outputs
│   ├── data/                # Static data
│   │   ├── cities.ts        # Predefined city coordinates and timezones
│   │   └── sanskrit_names.ts # Sanskrit names for calendar elements
│   ├── utils/               # Helper utilities
│   │   └── helpers.ts       # Date/time helper functions
│   └── __tests__/           # Jest test files mirroring src structure
├── dist/                    # Build output (not in version control)
│   ├── index.cjs.js        # CommonJS build
│   ├── index.esm.js        # ES Module build
│   └── types/              # TypeScript declarations
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
├── rollup.config.js        # Build configuration
└── jest.config.ts          # Test configuration
```

## Coding Standards

### TypeScript Guidelines

1. **Type Safety**: Always use explicit types for function parameters and return values
2. **Strict Mode**: The project uses TypeScript strict mode (`strict: true`)
3. **Async/Await**: Use async/await for asynchronous operations (e.g., nakshatra and yoga calculations)
4. **Naming Conventions**:
   - Use camelCase for variables and functions: `computeTithi`, `sunriseTime`
   - Use PascalCase for types and interfaces: `PanchangaInput`, `TithiResult`
   - Use descriptive names that reflect Hindu calendar terminology

### Code Style

1. **Imports**: Group imports logically (external packages, then local modules)
2. **Comments**: Use comments to explain Hindu calendar concepts and astronomical calculations
3. **Error Handling**: Throw descriptive errors for invalid inputs (e.g., missing geographical parameters)
4. **Modularity**: Keep calculation functions focused and in separate files

### Astronomical Calculations

1. Use `astronomy-engine` package types: `AstroTime`, `Observer`
2. Times should be in ISO 8601 format when serialized
3. Calculations use Julian Day numbers for astronomical precision
4. Handle timezone conversions carefully using `moment-timezone`

## Testing Requirements

### Test Framework

- Uses **Jest** with `ts-jest` preset for TypeScript support
- Test files are located in `src/__tests__/` mirroring the source structure
- Configuration: `jest.config.ts`

### Testing Guidelines

1. **Test File Naming**: `*.test.ts` files should match the source file they test
2. **Test Structure**: Use `describe` blocks for grouping related tests
3. **Assertions**: Test for:
   - Correct calculation ranges (e.g., tithi index between 1-30)
   - Proper type validation
   - End times are logical (later than start times)
   - Edge cases (leap months, skipped tithis)

4. **Test Data**: Use specific dates for reproducible tests
   - Default test location: Bangalore, India (12.9716°N, 77.5946°E)
   - Include multiple test dates to cover different scenarios

5. **Running Tests**:
   ```bash
   npm test
   ```

### Required Test Coverage

- All new calculation functions must include tests
- Test both typical cases and edge cases
- Validate astronomical calculations against known values when possible

## Build and Development

### Commands

```bash
# Install dependencies
npm install

# Build the library (outputs to dist/)
npm run build

# Run tests
npm test

# Create a release
npm run release
```

### Build Process

- Uses **Rollup** for bundling
- Outputs both CommonJS (`dist/index.cjs.js`) and ES Module (`dist/index.esm.js`) formats
- TypeScript declarations are generated in `dist/types/`
- External dependencies (`astronomy-engine`, `moment-timezone`) are not bundled

### Development Workflow

1. Make changes in `src/` directory
2. Add corresponding tests in `src/__tests__/`
3. Run tests to verify changes
4. Build the library to ensure no compilation errors
5. Test the built library if making significant changes

## Change Management

### Pull Request Requirements

1. **Code Changes**:
   - All calculation logic changes require corresponding unit tests
   - Maintain backward compatibility for public API functions
   - Update TypeScript types if adding new fields to responses

2. **Documentation**:
   - Update inline comments for complex astronomical calculations
   - Add JSDoc comments for new public functions
   - Update this file if adding new conventions or changing structure

3. **Testing**:
   - All tests must pass before merge
   - Add tests for new features and bug fixes
   - Maintain or improve test coverage

4. **Build**:
   - Code must compile without TypeScript errors
   - Build artifacts (`dist/`) should not be committed

## Security Considerations

### Input Validation

1. **Date Inputs**: Validate date strings can be parsed correctly
2. **Geographical Inputs**: 
   - Latitude: -90 to 90 degrees
   - Longitude: -180 to 180 degrees
   - Timezone: Valid IANA timezone string
3. **City Names**: Validate against the predefined cities database

### Dependencies

- `astronomy-engine` and `moment-timezone` are peer dependencies (not bundled with the library)
- Consuming applications must install these dependencies themselves
- Keep dependencies up to date for security patches
- Run `npm audit` regularly to check for vulnerabilities

### Sensitive Data

- No API keys, credentials, or secrets in code
- No personal identifiable information (PII) in test data
- City database contains only public geographical data

## Domain-Specific Knowledge

### Hindu Calendar Concepts

When working on this project, be aware of these key concepts:

1. **Tithi**: Based on moon phase, 30 tithis per lunar month (1-15 in each half)
2. **Nakshatra**: 27 lunar mansions, each 13°20' of the zodiac
3. **Masa**: Lunar months named after nakshatras
4. **Adhika Masa**: Leap month when sun stays in same sign across new moons
5. **Ahargana**: Day count from Kali Yuga epoch (February 18, 3102 BCE, Julian calendar)
6. **Samvatsara**: 60-year naming cycle
7. **Panchanga**: Literally "five limbs" (tithi, vaara, nakshatra, yoga, karana)

### Astronomical Precision

- Calculations are timezone-aware
- Hindu calendar day starts at sunrise, not midnight
- Leap tithis and skipped tithis can occur based on astronomical phenomena

## API Guidelines

### Main Function

The primary export is `calculatePanchanga(input: PanchangaInput): Promise<PanchangaResponse>`

**Input Options**:
- By city name: `{ date, city }`
- By coordinates: `{ date, latitude, longitude, timezone }`

**Output**: Complete panchanga with all elements, each containing:
- `index`: Numerical index
- `value`: Sanskrit name
- `description`: Explanation of the element
- `start`/`end`: ISO 8601 timestamps (where applicable)

### Adding New Features

When adding new panchanga elements:

1. Create calculation function in `src/calculations/`
2. Add types to `src/models/types.ts`
3. Update main function in `src/index.ts`
4. Add Sanskrit names to `src/data/sanskrit_names.ts` if needed
5. Write comprehensive tests
6. Update response type documentation

## Common Tasks

### Adding a New City

1. Add entry to `src/data/cities.ts` with latitude, longitude, and timezone
2. Follow existing format with TitleCase city names

### Fixing a Calculation Issue

1. Identify which calculation file is affected (`src/calculations/`)
2. Review astronomical formulas and Hindu calendar rules
3. Add test case that demonstrates the issue
4. Fix the calculation
5. Verify all existing tests still pass

### Updating Dependencies

1. Check for breaking changes in `astronomy-engine` or `moment-timezone`
2. Update peer dependency version ranges in `package.json`
3. Test calculations with updated dependencies
4. Update documentation if API changes

## Resources

- [Astronomy Engine Documentation](https://github.com/cosinekitty/astronomy)
- [Hindu Calendar System](https://en.wikipedia.org/wiki/Hindu_calendar)
- [Panchanga Principles](https://en.wikipedia.org/wiki/Panchang)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Best Practices for Copilot

When working on this repository:

1. **Understand the Domain**: Hindu calendar calculations have specific rules and astronomical basis
2. **Maintain Type Safety**: Always use proper TypeScript types
3. **Test Thoroughly**: Astronomical calculations require validation against known values
4. **Preserve Accuracy**: This is a library; precision and correctness are critical
5. **Document Well**: Complex astronomical formulas need clear explanations
6. **Consider Timezones**: Always account for timezone conversions in date/time calculations
7. **Validate Inputs**: Check for invalid geographical coordinates and date formats
8. **Follow Existing Patterns**: New calculations should follow the structure of existing ones
