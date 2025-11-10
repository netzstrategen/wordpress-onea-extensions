# WordPress Onea Extensions

## Architecture

This plugin works with **simplified PSR-11 compliant** service container and **Service Provider** pattern for clean service registration and bootstrapping.

### Directory Structure

```
includes/
├── Contracts/              # Interfaces and Abstract Classes
│   ├── ServiceInterface.php
│   ├── AbstractService.php
│   ├── ServiceProviderInterface.php
│   └── AbstractServiceProvider.php
├── Providers/              # Service Providers
│   ├── ElementorServiceProvider.php
│   ├── FormSubmissionServiceProvider.php
│   └── WooCommerceServiceProvider.php
├── Services/               # Business Logic
│   ├── Elementor/
│   │   ├── ElementorWidgetsService.php
│   │   └── Widgets/
│   ├── FormSubmission/
│   │   └── FormSubmissionService.php
│   └── WooCommerce/
│       ├── CartService.php
│       └── OrderMetaService.php
├── Exceptions/             # Custom Exceptions
│   ├── ContainerException.php
│   └── NotFoundException.php
├── Container.php           # Simplified PSR-11 Container
├── Plugin.php              # Main Plugin Class
├── Schema.php              # Plugin Lifecycle (activation/deactivation)
└── function-helpers.php    # Helper Functions

src/
└── components/             # React Components
    ├── multiple-step-form/ # Multi-step Form Component
    │   ├── index.tsx
    │   ├── MultipleStepForm.tsx
    │   ├── FormField.tsx
    │   ├── FormSummary.tsx
    │   ├── StepIndicator.tsx
    │   ├── form-schema.json
    │   ├── types.ts
    │   ├── style.scss
    │   ├── hooks/
    │   └── utils/
    └── ui/                 # Shadcn UI Components
        ├── button.tsx
        ├── checkbox.tsx
        ├── form.tsx
        ├── input.tsx
        ├── label.tsx
        ├── radio-group.tsx
        ├── select.tsx
        └── tooltip.tsx
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

In `includes/Plugin.php`, add your provider:

```php
protected array $providers = [
    ElementorServiceProvider::class,
    CustomServiceProvider::class, // Add here
];
```

## WooCommerce Integration

### Form Data with Products

The plugin provides functionality to attach form data to WooCommerce products, allowing multiple instances of the same product with different form submissions to appear as separate line items in orders.

#### Features

- **Cart Uniqueness**: Each product with different form data is treated as a unique cart item
- **Minimal Database Storage**: Form data is stored as hidden order meta (2 entries per item)
- **Dynamic Display**: Form fields are formatted for display on page load
- **File Uploads**: Support for file attachments with download links in orders

#### Services

**CartService** (`includes/Services/WooCommerce/CartService.php`):
- `add_product_with_form_data()`: Add products to cart with form data and file uploads
- `add_unique_cart_item_data()`: Ensures unique cart items using MD5 hash with timestamp

**OrderMetaService** (`includes/Services/WooCommerce/OrderMetaService.php`):
- `save_order_item_meta()`: Saves `_onea_form_data` and `_onea_uploaded_files` as hidden meta
- `format_order_item_meta()`: Dynamically formats form data for display in orders

#### Usage Example

```php
use function Netzstrategen\Onea\plugin;

$cart_service = plugin()::container()->get('woocommerce.cart');

$form_data = [
    'name' => ['value' => 'John Doe', 'label' => 'Name'],
    'plz' => ['value' => '12345', 'label' => 'ZIP Code'],
    'form_id' => '123',
];

$uploaded_files = [
    'document' => 456, // Attachment ID
];

$cart_service->add_product_with_form_data(
    product_id: 100,
    quantity: 1,
    form_data: $form_data,
    uploaded_files: $uploaded_files
);
```

## Form Submission API

### REST Endpoint

**Endpoint**: `POST /wp-json/onea/v1/submit-form`

**FormSubmissionService** (`includes/Services/FormSubmission/FormSubmissionService.php`):
- Handles form submissions via REST API
- Processes file uploads
- Adds product to WooCommerce cart with form data
- Returns cart redirect URL

**Request Body**:
```json
{
    "formData": {
        "name": {"value": "John Doe", "label": "Name"},
        "email": {"value": "john@example.com", "label": "Email"},
        "plz": {"value": "12345", "label": "ZIP Code"}
    },
    "uploadedFiles": {
        "document": [123, 456]
    },
    "formId": "123",
    "productId": 100
}
```

**Response**:
```json
{
    "success": true,
    "redirect_url": "https://example.com/cart/"
}
```

## Development

### Requirements

- PHP 8.1+
- WordPress 6.0+
- WooCommerce 8.0+
- Composer
- Node.js 18+ & pnpm

### Installation

**PHP Dependencies**:
```bash
composer install
```

**JavaScript Dependencies**:
```bash
pnpm install
```

**Build Assets**:
```bash
pnpm run build
```

**Development Mode**:
```bash
pnpm run start
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

### Debug Logging

The plugin includes a custom logging function for debugging:

```php
use function Netzstrategen\Onea\onea_log;

onea_log('Debug message', 'DEBUG');
onea_log('Error occurred', 'ERROR');
```

Logs are written to: `wordpress-onea-extensions/debug-onea.log` (requires `WP_DEBUG_LOG` enabled)