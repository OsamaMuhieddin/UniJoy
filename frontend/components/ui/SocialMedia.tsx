import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Github, Linkedin, Youtube, Facebook, Slack } from 'lucide-react';
import Link from 'next/link'
import { title } from 'process';
import React from 'react';


interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}
type SocialLink = {
  title?: string;
  href?: string;
  icon?: React.ReactNode;
}
const socialLink = [
  {
    title: "Youtube",
    href: "https://www.youtube.com",
    icon: <Youtube className='w-5 h-5' />
  },
  {
    title: "Github",
    href: "https://www.github.com/@reactjsBD",
    icon: <Github className='w-5 h-5' />
  },
  {
    title: "Linkedin",
    href: "https://www.linkedin.com/@reactjsBD",
    icon: <Linkedin className='w-5 h-5' />
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/@reactjsBD",
    icon: <Facebook className='w-5 h-5' />
  },
  {
    title: "Slack",
    href: "https://www.slack.com/@reactjsBD",
    icon: <Slack className='w-5 h-5' />
  }
]

const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={`flex item-center ${className}`}>
        {socialLink?.map((item, index) => (
          <Tooltip key={item?.title}>
            <TooltipTrigger asChild>
              <Link href={item?.href}
                target="_blank"
                rel='noopener noreferrer'
                className={`p-2 border rounded-full hover:text-white hover:border-white hoverEffect ${iconClassName}`}>
                {item?.icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent className={`bg-white p-1.5 m-2 rounded-md text-xs border-none text-darkColor font-semibold ${tooltipClassName}`}>
              {item?.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default SocialMedia
