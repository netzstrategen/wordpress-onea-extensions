# Component Development Guide

## Structure

Each component has its own isolated directory with TypeScript, React component, and styles:

```
src/components/
├── multiple-step-form/
│   ├── index.tsx              # Entry point & initialization
│   ├── MultipleStepForm.tsx   # React component
│   └── style.scss             # Component-specific styles
└── another-component/         # Add more components
    ├── index.tsx
    ├── AnotherComponent.tsx
    └── style.scss
```

## Adding a New Component

### 1. Create Component Directory

```bash
mkdir -p src/components/my-new-component
```

### 2. Create Entry Point (`index.tsx`)

```tsx
import { render } from '@wordpress/element';
import MyNewComponent from './MyNewComponent';
import './style.scss';

const init = (): void => {
	const containers = document.querySelectorAll<HTMLElement>('.onea-my-new-component-root');
	
	containers.forEach((container) => {
		if (container.dataset.initialized) {
			return;
		}
		
		const props = JSON.parse(container.dataset.props || '{}');
		render(<MyNewComponent {...props} />, container);
		container.dataset.initialized = 'true';
	});
};

document.addEventListener('DOMContentLoaded', init);
```

### 3. Create Component (`MyNewComponent.tsx`)

```tsx
import React from 'react';

interface MyNewComponentProps {
	componentId?: string;
	settings?: Record<string, unknown>;
}

const MyNewComponent: React.FC<MyNewComponentProps> = ({ componentId, settings }) => {
	return (
		<div className="onea-my-new-component">
			<h2>My New Component</h2>
		</div>
	);
};

export default MyNewComponent;
```

### 4. Create Styles (`style.scss`)

```scss
.onea-my-new-component {
	padding: 2rem;
	
	h2 {
		color: #333;
	}
}
```

### 5. Add to Webpack Config

Edit `webpack.config.js`:

```javascript
entry: {
	'components/multiple-step-form/index': path.resolve(
		process.cwd(),
		'src/components/multiple-step-form',
		'index.tsx'
	),
	'components/my-new-component/index': path.resolve(
		process.cwd(),
		'src/components/my-new-component',
		'index.tsx'
	),
},
```

### 6. Create Elementor Widget (PHP)

Create `includes/Services/Elementor/Widgets/MyNewComponent.php`:

```php
<?php
namespace Netzstrategen\Onea\Services\Elementor\Widgets;

use Elementor\Widget_Base;

class MyNewComponent extends Widget_Base {
	
	public function get_name(): string {
		return 'my_new_component';
	}
	
	public function get_title(): string {
		return __( 'My New Component', 'wp-onea-extensions' );
	}
	
	public function get_icon(): string {
		return 'eicon-code';
	}
	
	public function get_categories(): array {
		return [ 'onea' ];
	}
	
	protected function render(): void {
		$settings = $this->get_settings_for_display();
		$props = [
			'componentId' => $this->get_id(),
			'settings' => $settings,
		];
		?>
		<div 
			class="onea-my-new-component-root" 
			data-props="<?php echo esc_attr( wp_json_encode( $props ) ); ?>"
		>
		</div>
		<?php
	}
}
```

### 7. Register Widget

In `ElementorWidgetsService.php`:

```php
private array $widgets = [
	MultipleStepFormWidget::class,
	MyNewComponent::class, // Add here
];
```

### 8. Enqueue Assets

In `ElementorWidgetsService.php` `enqueue_frontend_assets()` method, add:

```php
public function enqueue_frontend_assets(): void {
	// Multiple Step Form
	$assets_file = plugin_dir_path( __DIR__ ) . '../build/components/multiple-step-form/index.asset.php';
	if ( file_exists( $assets_file ) ) {
		$assets = include $assets_file;
		wp_enqueue_script(
			'onea-multiple-step-form',
			plugin_dir_url( __DIR__ ) . '../build/components/multiple-step-form/index.js',
			$assets['dependencies'],
			$assets['version'],
			true
		);
		$style_file = plugin_dir_path( __DIR__ ) . '../build/components/multiple-step-form/style-index.css';
		if ( file_exists( $style_file ) ) {
			wp_enqueue_style(
				'onea-multiple-step-form',
				plugin_dir_url( __DIR__ ) . '../build/components/multiple-step-form/style-index.css',
				[],
				$assets['version']
			);
		}
	}
	
	// My New Component - Add here
	$assets_file = plugin_dir_path( __DIR__ ) . '../build/components/my-new-component/index.asset.php';
	if ( file_exists( $assets_file ) ) {
		$assets = include $assets_file;
		wp_enqueue_script(
			'onea-my-new-component',
			plugin_dir_url( __DIR__ ) . '../build/components/my-new-component/index.js',
			$assets['dependencies'],
			$assets['version'],
			true
		);
		$style_file = plugin_dir_path( __DIR__ ) . '../build/components/my-new-component/style-index.css';
		if ( file_exists( $style_file ) ) {
			wp_enqueue_style(
				'onea-my-new-component',
				plugin_dir_url( __DIR__ ) . '../build/components/my-new-component/style-index.css',
				[],
				$assets['version']
			);
		}
	}
}
```

### 9. Build

```bash
pnpm run build
```

## Build Output

Each component gets its own build directory:

```
build/components/
├── multiple-step-form/
│   ├── index.js
│   ├── index.asset.php
│   ├── style-index.css
│   └── style-index-rtl.css
└── my-new-component/
    ├── index.js
    ├── index.asset.php
    ├── style-index.css
    └── style-index-rtl.css
```

## Development Commands

```bash
# Development mode with hot reload
pnpm run start

# Production build
pnpm run build

# Lint JavaScript/TypeScript
pnpm run lint:js

# Lint CSS/SCSS
pnpm run lint:css
```

## Benefits

✅ **TypeScript** - Type safety and better DX  
✅ **Isolated Components** - Each component has its own bundle  
✅ **Optimized Loading** - Only load assets for components in use  
✅ **Easy Scaling** - Add new components without affecting existing ones  
✅ **WordPress Best Practices** - Uses `@wordpress/element` and proper dependencies  
