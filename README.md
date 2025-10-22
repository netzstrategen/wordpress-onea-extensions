# wordpress-onea-extensions
----

## Architecture and methodology
---

This plugin is created to support Onea (Online Energieausweis) web site extensions and custom codes included as services. It follows a **Laravel-inspired architecture** with a **PSR-11 compliant** service container and **Service Provider** pattern for clean service registration and bootstrapping.

### Directory Structure (Laravel-like):

```
src/
├── Contracts/          # Interfaces (like Laravel's Contracts)
│   ├── Service.php
│   └── ServiceProvider.php
├── Providers/          # Service Providers (like Laravel's app/Providers)
│   ├── ServiceProvider.php (base)
│   └── ElementorServiceProvider.php
├── Services/           # Business logic services (like Laravel's app/Services)
│   ├── AbstractService.php
│   └── Elementor/
│       └── EnergieausweisWidget.php
├── Exceptions/         # Custom exceptions
│   ├── ContainerException.php
│   └── NotFoundException.php
├── Container.php       # PSR-11 Container
├── Plugin.php          # Main plugin class
├── Schema.php          # Plugin lifecycle
└── function-helpers.php
```

### Key Features:
- **PSR-11 Container**: Implements `Psr\Container\ContainerInterface` for standardized dependency injection
- **Service Provider Pattern**: Separate registration and bootstrapping logic (Laravel-style)
- **Lazy Loading**: Services are instantiated only when needed (via `bind` and `singleton`)
- **Service Organization**: Clear separation between Providers (configuration) and Services (business logic)
- **Type-Safe**: Full type hints and return type declarations

## Adding a new service
---

### Method 1: Using Service Providers (Recommended)

1. **Create your service** in `src/Services/`:

```php
<?php

namespace Onea\Services;

class MyCustomService extends AbstractService
{
    public function init(): void
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_filter('the_content', [$this, 'modify_content']);
    }
    
    public function enqueue_assets(): void
    {
        // Your code here
    }
    
    public function modify_content($content): string
    {
        // Your code here
        return $content;
    }
}
```

Then register it in `src/Container.php`:

```php
private function registerDefaultBindings(): void
{
    $this->instance('myCustomService', new MyCustomService());
    // ... other services
}
```

## Accessing Services (PSR-11)
---

The container implements PSR-11 `ContainerInterface`, providing standardized methods to access services:

```php
use Onea\Plugin;

// Get the container
$container = Plugin::container();

// Check if a service exists
if ($container->has('myCustomService')) {
    $service = $container->get('myCustomService');
}

// Get a service (throws NotFoundException if not found)
$service = $container->get('myCustomService');

// Services registered with singleton() are only instantiated once
$service1 = $container->get('myCustomService'); // Instantiated here
$service2 = $container->get('myCustomService'); // Returns same instance
```

### PSR-11 Methods:
- `has(string $id): bool` - Check if service exists
- `get(string $id): mixed` - Retrieve service (throws `NotFoundException` if not found)

### Container Methods:
- `bind(string $id, callable $factory): void` - Register a service (new instance each time)
- `singleton(string $id, callable $factory): void` - Register a singleton service (instantiated once)
- `instance(string $id, mixed $instance): void` - Register an already instantiated object
- `register(string|ServiceProvider $provider): ServiceProvider` - Register a service provider
- `bootProviders(): void` - Boot all registered providers
