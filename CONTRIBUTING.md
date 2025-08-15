# Contributing to Smart Munic

Thank you for your interest in contributing to the Smart Munic Municipal Services Management System! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Issues
1. Check existing issues to avoid duplicates
2. Use the issue template when creating new issues
3. Provide detailed information including:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (browser, OS, etc.)
   - Screenshots if applicable

### Suggesting Features
1. Open a feature request issue
2. Clearly describe the proposed feature
3. Explain the use case and benefits
4. Consider implementation complexity
5. Be open to discussion and feedback

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/smart-munic.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

#### Development Guidelines

##### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (Prettier configuration included)
- Use meaningful variable and function names
- Add comments for complex logic
- Follow React best practices and hooks guidelines

##### Database Changes
- All schema changes must be made in `shared/schema.ts`
- Use Drizzle ORM for database operations
- Test schema changes locally before submitting
- Run `npm run db:push` to apply changes

##### Component Development
- Use functional components with hooks
- Implement proper TypeScript types
- Follow the existing component structure
- Use Tailwind CSS for styling
- Ensure responsive design
- Add proper error handling

##### API Development
- Follow RESTful principles
- Implement proper error handling
- Add input validation using Zod schemas
- Document API endpoints
- Include proper HTTP status codes

#### Testing
- Write tests for new features
- Ensure existing tests pass
- Test across different user roles
- Verify responsive design on mobile devices
- Test SMS and webhook functionality if applicable

#### Commit Guidelines
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits focused and atomic
- Write clear commit messages

Example:
```
feat(sms): add delivery receipt webhook handler
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
```

## 🏗️ Architecture Guidelines

### Frontend Structure
```
client/src/
├── components/         # Reusable UI components
├── pages/             # Page-level components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

### Backend Structure
```
server/
├── routes.ts          # Main API routes
├── storage.ts         # Database operations
└── middleware/        # Express middleware
```

### Shared Resources
```
shared/
├── schema.ts          # Database schema and types
└── types.ts           # Shared TypeScript types
```

## 🔐 Security Considerations

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines
- Test for common vulnerabilities

## 📋 Pull Request Process

1. **Pre-submission Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests pass locally
   - [ ] Documentation updated if needed
   - [ ] No sensitive data committed
   - [ ] Branch is up to date with main

2. **PR Description**
   - Clearly describe changes made
   - Reference related issues
   - Include screenshots for UI changes
   - Note any breaking changes
   - Add testing instructions

3. **Review Process**
   - PRs require at least one approval
   - Address all review comments
   - Keep PR scope focused and manageable
   - Be responsive to feedback

## 🚀 Deployment and Release

### Development Environment
- Local development uses `npm run dev`
- Database changes applied with `npm run db:push`
- Environment variables in `.env`

### Staging Environment
- Deploy to Replit for testing
- Verify all integrations work
- Test with production-like data

### Production Release
- Create release branch
- Update version numbers
- Tag release in Git
- Deploy using Replit Deployments

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report inappropriate behavior

### Communication
- Use GitHub issues for bug reports and feature requests
- Join discussions in pull requests
- Ask questions if you need clarification
- Share knowledge and help other contributors

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)

### Project-Specific
- `replit.md` - Project overview and architecture
- `PROJECT_SUMMARY.md` - Detailed project information
- `SMS_README.md` - SMS integration documentation

## 🔄 Getting Help

1. Check existing documentation
2. Search closed issues for similar problems
3. Create a new issue with detailed information
4. Be patient and respectful when asking for help

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor list

Thank you for helping make Smart Munic better! 🚀