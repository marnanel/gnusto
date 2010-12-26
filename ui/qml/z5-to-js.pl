use strict;
use warnings;
use File::Slurp;

die "Need filename" unless $ARGV[0];

my $z5 = read_file($ARGV[0]);

print "var zcode = [\n";

my $count = 0;
for (my $i=0; $i<length($z5); $i++) {
	my $str = ord(substr($z5, $i, 1)).',';
	if ($count+length($str)>75) {
		$count = 0;
		print "\n$str";
	} else {
		$count += length($str);
		print $str;
	}	
}

print "];\n";
