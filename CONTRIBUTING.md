# Contributing to ContestOrganizer

Thank you for your interest in contributing to ContestOrganizer! 🎉 We appreciate all contributions, whether it's bug reports, feature requests, documentation improvements, or code changes.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors

## 🚀 Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/contest-organizer.git
   cd contest-organizer
   ```

3. Set up the development environment (see below)
4. Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x
- Git

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Open `http://localhost:5173` in your browser

### Available Scripts

- `pnpm dev` - Development server with hot reload
- `pnpm run build` - Production build
- `pnpm test` - Run tests once
- `pnpm run lint` - Check code style and fix issues
- `pnpm run format` - Format code with Biome

## 🏗️ Project Structure

```
src/
├── components/          # Vanilla Web Components (BaseElement)
│   ├── page-match/      # Match management page
│   ├── page-tournament/ # Tournament management
│   ├── team-tile/       # Team display component
│   └── ...
├── modules/             # Business logic modules
│   ├── tournaments/     # Tournament management
│   ├── matchs/          # Match logic
│   ├── teams/           # Team handling
│   └── ...
├── core/                # Core framework (BaseElement, Signals)
├── global/              # Global styles and app setup
└── assets/              # Static assets
```

## 🔄 Development Workflow

1. **Choose an Issue**: Look for open issues or create one for your feature/bug
2. **Create a Branch**: Use descriptive branch names (`feature/add-dark-mode`, `fix/score-validation`)
3. **Make Changes**: Write clean, tested code
4. **Test Thoroughly**: Run tests and manual testing
5. **Commit**: Use conventional commit messages
6. **Push & PR**: Push your branch and create a pull request

### Commit Messages

We use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:

```
feat: add live scoring for basketball matches
fix: correct ranking calculation for tied teams
docs: update installation instructions
```

## 💻 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style (checked by Biome)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`

### Components (Vanilla Web Components)

- Use `BaseElement` as the base class for all components
- Follow the component naming convention: `mad-*`
- Keep components small and focused
- Use Signals for reactive state management
- Handle lifecycle properly via `connectedCallback` and `disconnectedCallback`

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Keep styles scoped to components

## 🧪 Testing

We use Vitest for testing:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- src/components/my-component/my-component.test.ts
```

### Writing Tests

- Write unit tests for utilities and modules
- Write integration tests for components
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

## 📝 Submitting Changes

1. Ensure all tests pass: `pnpm test`
2. Run linting: `pnpm run lint`
3. Format code: `pnpm run format`
4. Update documentation if needed
5. Commit with conventional commit message
6. Push to your fork
7. Create a Pull Request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Test coverage information

## 🐛 Reporting Issues

### Bug Reports

Please include:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable
- Console errors

### Feature Requests

Please include:

- Clear description of the feature
- Use case and benefits
- Mockups or examples if possible
- Related issues or discussions

## 📞 Getting Help

- 📧 **Email**: For sensitive issues
- 💬 **Discussions**: For general questions
- 🐛 **Issues**: For bugs and feature requests
- 📖 **Documentation**: Check existing docs first

## 🎯 Recognition

Contributors will be recognized in:

- Repository contributors list
- Release notes
- Special mentions for significant contributions

Thank you for contributing to ContestOrganizer! 🚀
