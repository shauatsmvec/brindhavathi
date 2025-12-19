# Contributing to E-Trends Explorer

Thank you for your interest in contributing to E-Trends Explorer! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/e-trends-explorer.git
   cd e-trends-explorer
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript checking happens automatically during build.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces for props and data structures
- Avoid using `any` type unless absolutely necessary
- Use proper type imports: `import type { ... } from '...'`

### React Components

- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Place component-specific types at the top of the file
- Use meaningful component and prop names

```tsx
// Good example
interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  // Component logic
}
```

### Styling

- Use Tailwind CSS utility classes
- Use design system tokens from `index.css`
- Avoid inline styles
- Use semantic color tokens, not hard-coded colors

```tsx
// Good
<div className="bg-card text-foreground border-border">

// Bad
<div className="bg-[#1a1a2e] text-white border-gray-700">
```

### File Organization

- Place page components in `src/pages/`
- Place reusable components in `src/components/`
- Group related components in subdirectories
- Create focused components, not monolithic files

## Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(inventory): add product search functionality
fix(sales): correct invoice total calculation
docs(readme): update installation instructions
style(dashboard): improve mobile responsiveness
```

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks** before submitting:
   ```bash
   npm run lint
   npm run build
   ```

3. **Create the Pull Request** with:
   - Clear title describing the change
   - Description of what was changed and why
   - Screenshots for UI changes
   - Reference to related issues

4. **Respond to feedback** promptly and make requested changes

5. **Squash commits** if requested before merge

## Reporting Issues

### Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable
- Console errors if any

### Feature Requests

When suggesting features, include:

- Clear description of the feature
- Use case / problem it solves
- Proposed solution (if any)
- Mockups or examples (if applicable)

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

---

Thank you for contributing to E-Trends Explorer! 🎉
