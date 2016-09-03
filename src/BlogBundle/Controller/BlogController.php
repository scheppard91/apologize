<?php
/**
 * Created by PhpStorm.
 * User: bouysset
 * Date: 02/09/16
 * Time: 23:21
 */

namespace BlogBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class BlogController extends Controller
{
    /**
     * @Route("/blog")
     * @Template("BlogBundle:blog:blog.html.twig")
     */
    public function blogAction()
    {
        return array(

        );
    }
}


