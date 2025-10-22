# WordPress Onea Extensions

WordPress plugin for Online Energieausweis (Onea)..

## Architecture

This plugin works with **simplified PSR-11 compliant** service container and **Service Provider** pattern for clean service registration and bootstrapping.

### Directory Structure

```
src/
├── Contracts/              # Interfaces and Abstract Classes
│   ├── ServiceInterface.php
│   ├── AbstractService.php
│   ├── ServiceProviderInterface.php
│   └── AbstractServiceProvider.php
├── Providers/              # Service Providers
│   └── ElementorServiceProvider.php
├── Services/               # Business Logic
│   └── Elementor/
│       ├── ElementorWidgetsService.php
│       ├── EnergieausweisWidget.php
│       └── Widgets/
│           └── ExampleWidget.php
├── Exceptions/             # Custom Exceptions
│   ├── ContainerException.php
│   └── NotFoundException.php
├── Container.php           # Simplified PSR-11 Container
├── Plugin.php              # Main Plugin Class
├── Schema.php              # Plugin Lifecycle (activation/deactivation)
└── function-helpers.php    # Helper Functions
```

### Key Features

- **PSR-11 Container**: Simplified implementation with `set()`, `get()`, and `has()` methods
- **Service Provider Pattern**: Two-phase initialization (register → boot)
- **Service Contract Enforcement**: All services must implement `ServiceInterface` with `init()` method
- **WPCS Compliant**: Follows WordPress Coding Standards 3.0

## How It Works

### 1. Service Providers

Service providers handle service registration and bootstrapping:

```php
<?php
namespace Netzstrategen\Onea\Providers;

use Netzstrategen\Onea\Contracts\AbstractServiceProvider;
use Netzstrategen\Onea\Services\Elementor\ElementorWidgetsService;

class ElementorServiceProvider extends AbstractServiceProvider {

    // Define services to register
    protected array $services = [
        'elementor.widgets' => ElementorWidgetsService::class,
        // Add more services here:
        // 'elementor.dynamic_tags' => ElementorDynamicTagsService::class,.
        // 'elementor.controls' => ElementorControlsService::class,.
    ];

    // Register services in the container
    public function register(): void {
        foreach ($this->services as $key => $class) {
            $this->container->set($key, new $class());
        }
    }

    // Boot services (call init() method)
    public function boot(): void {
        foreach ($this->services as $key => $class) {
            $this->boot_service($key);
        }
    }
}
```

### 2. Services

Services contain the actual business logic and must implement `ServiceInterface`:

```php
<?php
namespace Netzstrategen\Onea\Services\Elementor;

use Netzstrategen\Onea\Contracts\AbstractService;

class ElementorWidgetsService extends AbstractService {

    // Required by ServiceInterface
    public function init(): void {
        add_action('elementor/widgets/register', [$this, 'register_widgets']);
        add_action('elementor/elements/categories_registered', [$this, 'register_widget_categories']);
    }

    public function register_widgets($widgets_manager): void {
        require_once __DIR__ . '/Widgets/ExampleWidget.php';
        $widgets_manager->register(new \Netzstrategen\Onea\Services\Elementor\Widgets\ExampleWidget());
    }

    public function register_widget_categories($elements_manager): void {
        $elements_manager->add_category('onea', [
            'title' => __('Onea', 'onea'),
            'icon' => 'fa fa-plug',
        ]);
    }
}
```

### 3. Container Usage

The simplified container provides three main methods:

```php
use Netzstrategen\Onea\Plugin;

$container = Plugin::container();

// Set a service
$container->set('my.service', new MyService());

// Check if service exists
if ($container->has('my.service')) {
    // Get the service
    $service = $container->get('my.service');
}
```

## Adding a New Service

### Step 1: Create Your Service Class

Create a new service in `src/Services/`:

```php
<?php
namespace Netzstrategen\Onea\Services;

use Netzstrategen\Onea\Contracts\AbstractService;

class MyCustomService extends AbstractService {

    public function init(): void {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_filter('the_content', [$this, 'modify_content']);
    }
    
    public function enqueue_assets(): void {
        wp_enqueue_style('my-custom-style', plugin_dir_url(__FILE__) . 'assets/style.css');
    }
    
    public function modify_content($content): string {
        // Your custom logic here
        return $content;
    }
}
```

### Step 2: Create a Service Provider (or use existing)

Option A: Add to existing provider (e.g., `ElementorServiceProvider`):

```php
protected array $services = [
    'elementor.widgets' => ElementorWidgetsService::class,
    'my.custom' => MyCustomService::class, // Add here
];
```

Option B: Create a new provider:

```php
<?php
namespace Netzstrategen\Onea\Providers;

use Netzstrategen\Onea\Contracts\AbstractServiceProvider;
use Netzstrategen\Onea\Services\MyCustomService;

class CustomServiceProvider extends AbstractServiceProvider {

    protected array $services = [
        'my.custom' => MyCustomService::class,
    ];

    public function register(): void {
        foreach ($this->services as $key => $class) {
            $this->container->set($key, new $class());
        }
    }

    public function boot(): void {
        foreach ($this->services as $key => $class) {
            $this->boot_service($key);
        }
    }
}
```

### Step 3: Register Provider in Plugin

In `src/Plugin.php`, add your provider:

```php
protected array $providers = [
    ElementorServiceProvider::class,
    CustomServiceProvider::class, // Add here
];
```

## Development

### Requirements

- PHP 8.1+
- WordPress 6.0+
- Composer

### Installation

```bash
composer install
```

### Code Standards

Run WordPress Coding Standards check:

```bash
./vendor/bin/phpcs --standard=phpcs.ruleset.xml
```

Auto-fix violations:

```bash
./vendor/bin/phpcbf --standard=phpcs.ruleset.xml
```