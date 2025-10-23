<?php
/**
 * Container Exception.
 *
 * @package Netzstrategen\Onea\Exceptions
 */

namespace Netzstrategen\Onea\Exceptions;

use Exception;
use Psr\Container\ContainerExceptionInterface;

/**
 * Generic exception in the container.
 */
class ContainerException extends Exception implements ContainerExceptionInterface {

}
