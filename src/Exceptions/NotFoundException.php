<?php
/**
 * Not Found Exception.
 *
 * @package Netzstrategen\Onea\Exceptions
 */

namespace Netzstrategen\Onea\Exceptions;

use Exception;
use Psr\Container\NotFoundExceptionInterface;

/**
 * Exception thrown when an entry is not found in the container.
 */
class NotFoundException extends Exception implements NotFoundExceptionInterface {

}
